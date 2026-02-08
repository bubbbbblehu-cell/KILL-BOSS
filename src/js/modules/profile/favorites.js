/**
 * 我的模块 - 我的收藏功能
 * 显示和管理用户收藏的帖子
 */

import { getSupabaseClient } from '../../supabase.js';
import { appState } from '../../state.js';

/**
 * 初始化我的收藏
 */
export async function initFavorites() {
    console.log("⭐ 初始化我的收藏...");
    
    if (!appState.user || appState.isGuest) {
        showLoginPrompt();
        return;
    }

    await loadFavorites();
}

/**
 * 加载收藏列表
 */
async function loadFavorites() {
    const client = getSupabaseClient();
    const container = document.getElementById('favoritesContainer');
    
    if (!container) return;

    if (!client) {
        container.innerHTML = '<div class="no-favorites">网络连接异常</div>';
        return;
    }

    try {
        // 先查询收藏
        const { data: favoritesData, error: favoritesError } = await client
            .from('favorites')
            .select('*, post:posts(*)')
            .eq('user_id', appState.user.id)
            .order('created_at', { ascending: false });

        if (favoritesError) {
            console.error("❌ 加载收藏失败:", favoritesError);
            container.innerHTML = '<div class="error">加载失败</div>';
            return;
        }

        // 获取所有用户ID
        const userIds = [...new Set((favoritesData || []).map(f => f.post?.user_id).filter(Boolean))];
        
        // 查询用户信息
        let usersMap = {};
        if (userIds.length > 0) {
            const { data: usersData } = await client
                .from('users')
                .select('id, name')
                .in('id', userIds);
            
            if (usersData) {
                usersMap = usersData.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {});
            }
        }

        // 合并数据
        const data = (favoritesData || []).map(fav => ({
            ...fav,
            post: fav.post ? {
                ...fav.post,
                user: usersMap[fav.post.user_id] || {
                    id: fav.post.user_id,
                    name: fav.post.user_id.split('-')[0] || '用户'
                }
            } : null
        })).filter(fav => fav.post);

        renderFavorites(container, data);
    } catch (err) {
        console.error("❌ 加载收藏异常:", err);
        container.innerHTML = '<div class="error">加载失败</div>';
    }
}

/**
 * 渲染收藏列表
 */
function renderFavorites(container, favorites) {
    if (favorites.length === 0) {
        container.innerHTML = '<div class="no-favorites">还没有收藏任何内容</div>';
        return;
    }

    container.innerHTML = favorites.map(fav => {
        const post = fav.post;
        if (!post) return '';

        return `
            <div class="favorite-item" data-favorite-id="${fav.id}" data-post-id="${post.id}">
                <div class="favorite-preview">
                    ${post.image_url ? `<img src="${post.image_url}" alt="帖子图片">` : ''}
                    ${post.text_content ? `<p>${post.text_content.substring(0, 50)}${post.text_content.length > 50 ? '...' : ''}</p>` : ''}
                </div>
                <div class="favorite-info">
                    <div class="favorite-author">${post.user?.name || '匿名用户'}</div>
                    <div class="favorite-stats">
                        <span>👍 ${post.likes_count || 0}</span>
                        <span>💬 ${post.comments_count || 0}</span>
                    </div>
                    <div class="favorite-time">收藏于 ${formatDate(fav.created_at)}</div>
                </div>
                <button onclick="removeFavorite(${fav.id})" class="btn-remove-favorite">取消收藏</button>
            </div>
        `;
    }).join('');
}

/**
 * 取消收藏
 */
export async function removeFavorite(favoriteId) {
    const client = getSupabaseClient();
    if (!client) {
        alert("网络连接异常");
        return;
    }

    try {
        const { error } = await client
            .from('favorites')
            .delete()
            .eq('id', favoriteId)
            .eq('user_id', appState.user.id);

        if (error) {
            console.error("❌ 取消收藏失败:", error);
            alert("操作失败: " + error.message);
            return;
        }

        console.log("✅ 已取消收藏");
        
        // 重新加载列表
        await loadFavorites();
    } catch (err) {
        console.error("❌ 取消收藏异常:", err);
        alert("操作失败，请稍后重试");
    }
}

/**
 * 添加收藏
 */
export async function addFavorite(postId) {
    if (!appState.user || appState.isGuest) {
        alert("请先登录");
        return false;
    }

    const client = getSupabaseClient();
    if (!client) {
        alert("网络连接异常");
        return false;
    }

    try {
        const { error } = await client
            .from('favorites')
            .insert({
                user_id: appState.user.id,
                post_id: postId
            });

        if (error) {
            if (error.code === '23505') { // 唯一约束冲突，已收藏
                console.log("ℹ️ 已收藏过该帖子");
                return false;
            }
            console.error("❌ 收藏失败:", error);
            alert("收藏失败: " + error.message);
            return false;
        }

        console.log("✅ 收藏成功");
        return true;
    } catch (err) {
        console.error("❌ 收藏异常:", err);
        alert("收藏失败，请稍后重试");
        return false;
    }
}

/**
 * 显示登录提示
 */
function showLoginPrompt() {
    const container = document.getElementById('favoritesContainer');
    if (container) {
        container.innerHTML = '<div class="login-prompt">请先登录查看我的收藏</div>';
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
window.removeFavorite = removeFavorite;
window.addFavorite = addFavorite;
window.showFavorites = initFavorites;
