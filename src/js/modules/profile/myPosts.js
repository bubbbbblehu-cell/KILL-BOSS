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

// 导出到 window
window.deletePost = deletePost;
window.editPost = editPost;
window.showMyPosts = initMyPosts;
