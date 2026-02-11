/**
 * 我的模块 - 我的帖子功能
 * 显示和管理用户发布的帖子
 */

import { getSupabaseClient } from '../../supabase.js';
import { appState } from '../../state.js';

/**
 * 初始化我的帖子页面
 */
export async function initMyPosts() {
    console.log("📝 初始化我的帖子...");
    
    if (!appState.user || appState.isGuest) {
        showLoginPrompt();
        return;
    }

    await loadMyPosts();
}

/**
 * 加载我的帖子
 */
async function loadMyPosts() {
    const client = getSupabaseClient();
    const container = document.getElementById('myPostsContainer');
    
    if (!container) return;

    if (!client) {
        container.innerHTML = '<div class="no-posts">网络连接异常</div>';
        return;
    }

    try {
        const { data, error } = await client
            .from('posts')
            .select('*')
            .eq('user_id', appState.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("❌ 加载我的帖子失败:", error);
            container.innerHTML = '<div class="error">加载失败</div>';
            return;
        }

        renderMyPosts(container, data || []);
    } catch (err) {
        console.error("❌ 加载我的帖子异常:", err);
        container.innerHTML = '<div class="error">加载失败</div>';
    }
}

/**
 * 渲染我的帖子列表
 */
function renderMyPosts(container, posts) {
    if (posts.length === 0) {
        container.innerHTML = '<div class="no-posts">还没有发布过帖子，快去发一个吧~</div>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="my-post-item" data-post-id="${post.id}">
            <div class="post-preview">
                ${post.image_url ? `<img src="${post.image_url}" alt="帖子图片">` : ''}
                ${post.text_content ? `<p>${post.text_content.substring(0, 50)}${post.text_content.length > 50 ? '...' : ''}</p>` : ''}
            </div>
            <div class="post-stats">
                <span>👍 ${post.likes_count || 0}</span>
                <span>💬 ${post.comments_count || 0}</span>
                <span>📅 ${formatDate(post.created_at)}</span>
            </div>
            <div class="post-actions">
                <button onclick="editPost(${post.id})" class="btn-edit">编辑</button>
                <button onclick="deletePost(${post.id})" class="btn-delete">删除</button>
            </div>
        </div>
    `).join('');
}

/**
 * 删除帖子
 */
export async function deletePost(postId) {
    if (!confirm("确定要删除这条帖子吗？")) {
        return;
    }

    const client = getSupabaseClient();
    if (!client) {
        alert("网络连接异常");
        return;
    }

    try {
        const { error } = await client
            .from('posts')
            .delete()
            .eq('id', postId)
            .eq('user_id', appState.user.id);

        if (error) {
            console.error("❌ 删除失败:", error);
            alert("删除失败: " + error.message);
            return;
        }

        console.log("✅ 删除成功");
        
        // 重新加载列表
        await loadMyPosts();
    } catch (err) {
        console.error("❌ 删除异常:", err);
        alert("删除失败，请稍后重试");
    }
}

/**
 * 编辑帖子
 */
export function editPost(postId) {
    console.log("编辑帖子:", postId);
    // TODO: 实现编辑功能
    alert("编辑功能开发中...");
}

/**
 * 显示登录提示
 */
function showLoginPrompt() {
    const container = document.getElementById('myPostsContainer');
    if (container) {
        container.innerHTML = '<div class="login-prompt">请先登录查看我的帖子</div>';
    }
}

/**
 * 格式化日期
 */
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()}`;
}

/**
 * 显示我的作品（在个人中心点击时调用）
 */
export async function showMyWorks() {
    console.log("📝 查看我的作品...");
    
    if (!appState.user || appState.isGuest) {
        alert("游客模式不能查看作品，请先登录");
        return;
    }

    const client = getSupabaseClient();
    if (!client) {
        alert("网络连接异常");
        return;
    }

    try {
        // 查询用户的帖子
        const { data, error } = await client
            .from('posts')
            .select('*')
            .eq('user_id', appState.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("❌ 加载我的作品失败:", error);
            alert("加载失败: " + error.message);
            return;
        }

        // 更新作品数量
        const worksCount = document.getElementById('userWorks');
        if (worksCount) {
            worksCount.textContent = data?.length || 0;
        }

        // 显示作品列表（简单弹窗）
        showWorksModal(data || []);
        
    } catch (err) {
        console.error("❌ 加载我的作品异常:", err);
        alert("加载失败，请稍后重试");
    }
}

/**
 * 显示作品列表弹窗
 */
function showWorksModal(posts) {
    // 创建弹窗
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="font-size: 18px; font-weight: 700;">我的作品 (${posts.length})</h3>
                <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-secondary);">×</button>
            </div>
            <div class="works-grid">
                ${posts.length === 0 ? '<div class="no-posts">还没有发布过作品，快去发一个吧~</div>' : 
                  posts.map(post => `
                    <div class="work-item">
                        ${post.image_url ? `<img src="${post.image_url}" alt="作品" style="width: 100%; border-radius: 12px; margin-bottom: 8px;">` : ''}
                        ${post.text_content ? `<p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${post.text_content.substring(0, 50)}${post.text_content.length > 50 ? '...' : ''}</p>` : ''}
                        <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
                            <span>👍 ${post.likes_count || 0}</span>
                            <span>💬 ${post.comments_count || 0}</span>
                        </div>
                    </div>
                  `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 导出到 window
window.deletePost = deletePost;
window.editPost = editPost;
window.showMyWorks = showMyWorks;
