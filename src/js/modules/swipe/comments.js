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
                       class="comment-input-field">
                <button onclick="submitComment('${postId}')" class="comment-submit-btn">发送</button>
            </div>
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
        const { data, error } = await client
            .from('comments')
            .select(`
                *,
                user:users(id, name, avatar)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error("❌ 加载评论失败:", error);
            commentsList.innerHTML = '<div class="error">加载评论失败</div>';
            return;
        }

        renderComments(commentsList, data || []);
    } catch (err) {
        console.error("❌ 加载评论异常:", err);
        commentsList.innerHTML = '<div class="error">加载评论失败</div>';
    }
}

/**
 * 渲染评论列表
 */
function renderComments(container, comments) {
    if (comments.length === 0) {
        container.innerHTML = '<div class="no-comments">暂无评论，快来抢沙发吧~</div>';
        return;
    }

    container.innerHTML = comments.map(comment => `
        <div class="comment-item" data-comment-id="${comment.id}">
            <div class="comment-avatar">${comment.user?.avatar || '👤'}</div>
            <div class="comment-content">
                <div class="comment-author">${comment.user?.name || '匿名用户'}</div>
                <div class="comment-text">${comment.content}</div>
                <div class="comment-time">${formatTime(comment.created_at)}</div>
            </div>
        </div>
    `).join('');
}

/**
 * 提交评论
 */
export async function submitComment(postId) {
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
        const { data, error } = await client
            .from('comments')
            .insert({
                post_id: postId,
                user_id: appState.user.id,
                content: content
            })
            .select(`
                *,
                user:users(id, name, avatar)
            `)
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
window.closeCommentsModal = closeCommentsModal;
