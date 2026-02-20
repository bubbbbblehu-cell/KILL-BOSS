/**
 * favorites.js - 我的收藏列表和管理模块
 * BOSS KILL 项目
 */

// 收藏数据
const favoritesData = {
    posts: [
        { 
            id: 1, 
            title: '办公室摸鱼指南：如何优雅地度过996', 
            author: '摸鱼达人', 
            time: '2天前', 
            avatar: '🐟' 
        },
        { 
            id: 2, 
            title: '今天的老板格外讨厌，必须画个便便送给他', 
            author: '打工怒人', 
            time: '3天前', 
            avatar: '💩' 
        },
        { 
            id: 3, 
            title: '连续画便便30天，我的心情好多了', 
            author: '艺术家', 
            time: '1周前', 
            avatar: '🎨' 
        }
    ],
    comments: [
        { 
            id: 1, 
            content: '"这个画得太像我老板了哈哈哈"', 
            postTitle: '办公室摸鱼指南', 
            author: '路人甲', 
            time: '1天前', 
            avatar: '😂' 
        },
        { 
            id: 2, 
            content: '"同感！我也想扔便便给他"', 
            postTitle: '今天的老板格外讨厌', 
            author: '同事乙', 
            time: '2天前', 
            avatar: '🤝' 
        }
    ],
    users: [
        { 
            id: 1, 
            name: '摸鱼达人', 
            bio: '专业摸鱼20年', 
            followers: 1234, 
            avatar: '🐟' 
        },
        { 
            id: 2, 
            name: '艺术家', 
            bio: '用便便画出人生', 
            followers: 5678, 
            avatar: '🎨' 
        },
        { 
            id: 3, 
            name: '打工怒人', 
            bio: '996福报接受者', 
            followers: 999, 
            avatar: '😤' 
        }
    ]
};

// 当前选中的标签
let currentFavoritesTab = 'posts';

/**
 * 显示收藏页面
 */
function showFavorites() {
    if (typeof switchPage === 'function') {
        switchPage('favorites');
    }
    loadFavoritesContent('posts');
}

/**
 * 切换标签页
 */
function switchFavoritesTab(tab) {
    currentFavoritesTab = tab;
    
    // 更新标签状态
    document.querySelectorAll('.favorites-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    
    loadFavoritesContent(tab);
}

/**
 * 加载收藏内容
 */
function loadFavoritesContent(tab) {
    const container = document.getElementById('favoritesContent');
    if (!container) return;
    
    const data = favoritesData[tab];

    // 空状态处理
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <div class="empty-text">暂无收藏内容</div>
            </div>
        `;
        return;
    }

    let html = '';
    
    // 渲染帖子收藏
    if (tab === 'posts') {
        data.forEach(item => {
            html += `
                <div class="favorite-item">
                    <div class="favorite-item-avatar">${item.avatar}</div>
                    <div class="favorite-item-content">
                        <div class="favorite-item-title">${item.title}</div>
                        <div class="favorite-item-meta">${item.author} · ${item.time}</div>
                    </div>
                    <div class="favorite-item-actions">
                        <button class="unfavorite-btn" onclick="unfavorite('posts', ${item.id})">取消收藏</button>
                    </div>
                </div>
            `;
        });
    } 
    // 渲染评论收藏
    else if (tab === 'comments') {
        data.forEach(item => {
            html += `
                <div class="favorite-item">
                    <div class="favorite-item-avatar">${item.avatar}</div>
                    <div class="favorite-item-content">
                        <div class="favorite-item-title">${item.content}</div>
                        <div class="favorite-item-meta">来自《${item.postTitle}》· ${item.author} · ${item.time}</div>
                    </div>
                    <div class="favorite-item-actions">
                        <button class="unfavorite-btn" onclick="unfavorite('comments', ${item.id})">取消收藏</button>
                    </div>
                </div>
            `;
        });
    } 
    // 渲染用户收藏
    else if (tab === 'users') {
        data.forEach(item => {
            html += `
                <div class="favorite-item">
                    <div class="favorite-item-avatar" style="border-radius: 50%;">${item.avatar}</div>
                    <div class="favorite-item-content">
                        <div class="favorite-item-title">${item.name}</div>
                        <div class="favorite-item-meta">${item.bio} · ${item.followers}粉丝</div>
                    </div>
                    <div class="favorite-item-actions">
                        <button class="unfavorite-btn" onclick="unfavorite('users', ${item.id})">取消关注</button>
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = html;
}

/**
 * 取消收藏
 * API: DELETE /api/action/record (删除 action_type='favorite' 的记录)
 * 数据库: user_actions 表
 */
async function unfavorite(type, id) {
    try {
        // 调用API删除收藏记录
        // 实际应该调用: DELETE /api/favorites/{type}/{id}
        // 或者删除 user_actions 中 action_type='favorite' 的记录
        console.log('API调用: 删除收藏', {
            user_id: 'user_001',
            content_id: id,
            action_type: 'favorite',
            target_type: type
        });
        
        // 从数据中移除
        const index = favoritesData[type].findIndex(item => item.id === id);
        if (index > -1) {
            favoritesData[type].splice(index, 1);
        }
        
        // 重新加载内容
        loadFavoritesContent(currentFavoritesTab);
        
        // 显示提示
        if (typeof showToast === 'function') {
            showToast('已取消收藏');
        } else {
            alert('已取消收藏');
        }
    } catch (error) {
        console.error('取消收藏失败:', error);
        if (typeof showToast === 'function') {
            showToast('操作失败，请重试');
        }
    }
}

/**
 * 收藏内容（在其他页面调用）
 * API: POST /api/action/record
 * 数据库: user_actions 表, action_type = 'favorite'
 */
async function favoriteContent(contentId, contentType = 'posts') {
    try {
        // 调用API记录收藏行为
        // 实际应该调用: POST /api/action/record
        // 参数: user_id, content_id, action_type='favorite', action_value=1
        console.log('API调用: api_action_record', {
            user_id: 'user_001',
            content_id: contentId,
            action_type: 'favorite',
            action_value: 1
        });
        
        if (typeof showToast === 'function') {
            showToast('收藏成功！');
        } else {
            alert('收藏成功！');
        }
    } catch (error) {
        console.error('收藏失败:', error);
        if (typeof showToast === 'function') {
            showToast('收藏失败，请重试');
        }
    }
}

console.log('✅ favorites.js 模块已加载');

