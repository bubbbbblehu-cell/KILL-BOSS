/**
 * 划一划发帖模块 - 评论功能
 * 处理帖子评论的显示、添加、删除等
 */

import { getSupabaseClient } from '../../supabase.js';
import { appState } from '../../state.js';

/**
 * 显示评论弹窗
 */
export async function showComments(postId) {
    console.log("💬 显示评论:", postId);
    
    // 创建评论弹窗
    const modal = createCommentsModal(postId);
    document.body.appendChild(modal);
    
    // 加载评论列表
    await loadComments(postId);
}

/**
 * 创建评论弹窗
 */
function createCommentsModal(postId) {
    const modal = document.createElement('div');
    modal.className = 'comments-modal';
    modal.id = `commentsModal-${postId}`;
    
    modal.innerHTML = `
        <div class="comments-modal-content">
            <div class="comments-header">
                <h3>评论</h3>
                <button class="close-btn" onclick="closeCommentsModal('${postId}')">×</button>
            </div>
            <div class="comments-list" id="commentsList-${postId}">
                <div class="loading">加载中...</div>
            </div>
            <div class="comments-input">
                <input type="text" 
                       id="commentInput-${postId}" 
                       placeholder="写下你的评论..."
                       class="comment-input-field"
                       onkeypress="if(event.key==='Enter') submitComment('${postId}')">
                <button onclick="submitComment('${postId}')" class="comment-submit-btn">发送</button>
            </div>
            <div id="replyInputContainer-${postId}"></div>
        </div>
    `;
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCommentsModal(postId);
        }
    });
    
    return modal;
}

/**
 * 加载评论列表
 */
async function loadComments(postId) {
    const client = getSupabaseClient();
    const commentsList = document.getElementById(`commentsList-${postId}`);
    
    if (!commentsList) return;
    
    if (!client) {
        commentsList.innerHTML = '<div class="no-comments">暂无评论</div>';
        return;
    }

    try {
        // 先查询评论
        const { data: commentsData, error: commentsError } = await client
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (commentsError) {
            throw commentsError;
        }

        // 获取用户ID并查询用户信息
        const userIds = [...new Set((commentsData || []).map(c => c.user_id))];
        let usersMap = {};
        
        if (userIds.length > 0) {
            try {
                const { data: usersData, error: usersError } = await client
                    .from('users')
                    .select('id, name, avatar_url')
                    .in('id', userIds);
                
                if (!usersError && usersData) {
                    usersMap = usersData.reduce((acc, user) => {
                        acc[user.id] = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar_url
                        };
                        return acc;
                    }, {});
                }
            } catch (usersErr) {
                console.warn("⚠️ 查询用户信息失败（users 表可能不存在）:", usersErr);
                // 继续执行，使用默认用户信息
            }
        }

        // 合并数据
        const data = (commentsData || []).map(comment => ({
            ...comment,
            user: usersMap[comment.user_id] || {
                id: comment.user_id,
                name: comment.user_id.split('-')[0] || '用户',
                avatar: null
            }
        }));

        // 组织评论层级结构（支持回复）
        const organizedComments = organizeComments(data || []);

        renderComments(commentsList, organizedComments);
    } catch (err) {
        console.error("❌ 加载评论异常:", err);
        commentsList.innerHTML = '<div class="error">加载评论失败</div>';
    }
}

/**
 * 组织评论层级结构（支持回复）
 */
function organizeComments(comments) {
    const commentMap = new Map();
    const rootComments = [];
    
    // 先建立所有评论的映射
    comments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
    });
    
    // 组织层级关系
    comments.forEach(comment => {
        const commentNode = commentMap.get(comment.id);
        if (comment.parent_id) {
            // 这是回复
            const parent = commentMap.get(comment.parent_id);
            if (parent) {
                parent.replies.push(commentNode);
            } else {
                // 父评论不存在，当作根评论处理
                rootComments.push(commentNode);
            }
        } else {
            // 这是根评论
            rootComments.push(commentNode);
        }
    });
    
    return rootComments;
}

/**
 * 渲染评论列表（支持回复）
 */
function renderComments(container, comments) {
    if (comments.length === 0) {
        container.innerHTML = '<div class="no-comments">暂无评论，快来抢沙发吧~</div>';
        return;
    }

    container.innerHTML = comments.map(comment => renderCommentItem(comment)).join('');
}

/**
 * 渲染单个评论项（支持回复）
 */
function renderCommentItem(comment, isReply = false) {
    const postId = comment.post_id || document.querySelector('.comments-modal')?.id?.replace('commentsModal-', '');
    const replyClass = isReply ? 'comment-reply' : '';
    
    return `
        <div class="comment-item ${replyClass}" data-comment-id="${comment.id}">
            <div class="comment-avatar">${comment.user?.avatar || '👤'}</div>
            <div class="comment-content">
                <div class="comment-header">
                    <div class="comment-author">${comment.user?.name || '匿名用户'}</div>
                    <div class="comment-time">${formatTime(comment.created_at)}</div>
                </div>
                <div class="comment-text">${escapeHtml(comment.content)}</div>
                <div class="comment-actions">
                    <button class="reply-btn" onclick="showReplyInput('${comment.id}', '${postId}', '${escapeHtml(comment.user?.name || '匿名用户')}')">
                        回复
                    </button>
                </div>
                ${comment.replies && comment.replies.length > 0 ? `
                    <div class="comment-replies">
                        ${comment.replies.map(reply => renderCommentItem(reply, true)).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * HTML转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 显示回复输入框
 */
export function showReplyInput(parentCommentId, postId, parentAuthorName) {
    const container = document.getElementById(`replyInputContainer-${postId}`);
    if (!container) return;
    
    // 移除已存在的回复输入框
    const existingReply = container.querySelector('.reply-input-wrapper');
    if (existingReply) {
        existingReply.remove();
        return;
    }
    
    // 创建回复输入框
    const replyInput = document.createElement('div');
    replyInput.className = 'reply-input-wrapper';
    replyInput.innerHTML = `
        <div class="reply-input-header">
            <span>回复 @${parentAuthorName}</span>
            <button class="cancel-reply-btn" onclick="cancelReply('${postId}')">取消</button>
        </div>
        <div class="reply-input-content">
            <input type="text" 
                   id="replyInput-${parentCommentId}" 
                   placeholder="写下你的回复..."
                   class="reply-input-field"
                   onkeypress="if(event.key==='Enter') submitReply('${parentCommentId}', '${postId}')">
            <button onclick="submitReply('${parentCommentId}', '${postId}')" class="reply-submit-btn">发送</button>
        </div>
    `;
    
    container.appendChild(replyInput);
    
    // 聚焦到输入框
    setTimeout(() => {
        document.getElementById(`replyInput-${parentCommentId}`)?.focus();
    }, 100);
}

/**
 * 取消回复
 */
export function cancelReply(postId) {
    const container = document.getElementById(`replyInputContainer-${postId}`);
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * 提交回复
 */
export async function submitReply(parentCommentId, postId) {
    const input = document.getElementById(`replyInput-${parentCommentId}`);
    const content = input?.value?.trim();
    
    if (!content) {
        alert("请输入回复内容");
        return;
    }

    if (!appState.user || appState.isGuest) {
        alert("请先登录");
        return;
    }

    const client = getSupabaseClient();
    if (!client) {
        alert("网络连接异常");
        return;
    }

    try {
        const { data, error } = await client
            .from('comments')
            .insert({
                post_id: postId,
                user_id: appState.user.id,
                content: content,
                parent_id: parentCommentId
            })
            .select('*')
            .single();

        if (error) {
            console.error("❌ 提交回复失败:", error);
            alert("回复失败: " + error.message);
            return;
        }

        console.log("✅ 回复成功:", data);
        
        // 清空输入框并移除回复输入框
        if (input) input.value = '';
        cancelReply(postId);
        
        // 重新加载评论列表
        await loadComments(postId);
        
        // 更新帖子评论数
        updatePostCommentCount(postId);
    } catch (err) {
        console.error("❌ 提交回复异常:", err);
        alert("回复失败，请稍后重试");
    }
}

/**
 * 提交评论（根评论）
 */
export async function submitComment(postId, parentId = null) {
    const input = document.getElementById(`commentInput-${postId}`);
    const content = input?.value?.trim();
    
    if (!content) {
        alert("请输入评论内容");
        return;
    }

    if (!appState.user || appState.isGuest) {
        alert("请先登录");
        return;
    }

    const client = getSupabaseClient();
    if (!client) {
        alert("网络连接异常");
        return;
    }

    try {
        const insertData = {
            post_id: postId,
            user_id: appState.user.id,
            content: content
        };
        
        if (parentId) {
            insertData.parent_id = parentId;
        }
        
        const { data, error } = await client
            .from('comments')
            .insert(insertData)
            .select('*')
            .single();

        if (error) {
            console.error("❌ 提交评论失败:", error);
            alert("评论失败: " + error.message);
            return;
        }

        console.log("✅ 评论成功:", data);
        
        // 清空输入框
        if (input) input.value = '';
        
        // 重新加载评论列表
        await loadComments(postId);
        
        // 更新帖子评论数
        updatePostCommentCount(postId);
    } catch (err) {
        console.error("❌ 提交评论异常:", err);
        alert("评论失败，请稍后重试");
    }
}

/**
 * 关闭评论弹窗
 */
export function closeCommentsModal(postId) {
    const modal = document.getElementById(`commentsModal-${postId}`);
    if (modal) {
        modal.remove();
    }
}

/**
 * 更新帖子评论数
 */
async function updatePostCommentCount(postId) {
    const client = getSupabaseClient();
    if (!client) return;

    try {
        // 获取评论数
        const { count } = await client
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

        // 更新帖子评论数
        await client
            .from('posts')
            .update({ comments_count: count })
            .eq('id', postId);

        // 更新UI
        const commentBtn = document.querySelector(`[data-post-id="${postId}"] .comment-btn .comment-count`);
        if (commentBtn) {
            commentBtn.textContent = count || 0;
        }
    } catch (err) {
        console.error("❌ 更新评论数失败:", err);
    }
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
}

// 导出到 window 供 HTML 调用
window.showComments = showComments;
window.submitComment = submitComment;
window.submitReply = submitReply;
window.showReplyInput = showReplyInput;
window.cancelReply = cancelReply;
window.closeCommentsModal = closeCommentsModal;
