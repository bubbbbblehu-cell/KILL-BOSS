/**
 * 划一划发帖模块 - 滑动Feed功能
 * 处理帖子滑动、点赞/取消点赞等交互
 */

import { getSupabaseClient } from '../../supabase.js';
import { appState } from '../../state.js';

let currentPostIndex = 0;
let posts = [];

/**
 * 初始化滑动Feed
 */
export async function initSwipeFeed() {
    console.log("📱 初始化滑动Feed...");
    await loadPosts();
    renderPosts();
    setupSwipeHandlers();
}

/**
 * 加载帖子列表
 */
async function loadPosts() {
    const client = getSupabaseClient();
    if (!client) {
        console.warn("⚠️ Supabase 未就绪，使用模拟数据");
        posts = getMockPosts();
        return;
    }

    try {
        const { data, error } = await client
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error("❌ 加载帖子失败:", error);
            posts = getMockPosts();
        } else {
            posts = data || [];
            console.log(`✅ 加载了 ${posts.length} 条帖子`);
        }
    } catch (err) {
        console.error("❌ 加载帖子异常:", err);
        posts = getMockPosts();
    }
}

/**
 * 渲染帖子列表
 */
function renderPosts() {
    const feedContainer = document.getElementById('contentFeed');
    if (!feedContainer) return;

    feedContainer.innerHTML = '';

    posts.forEach((post, index) => {
        const postElement = createPostElement(post, index);
        feedContainer.appendChild(postElement);
    });
}

/**
 * 创建帖子元素
 */
function createPostElement(post, index) {
    const div = document.createElement('div');
    div.className = 'swipe-post';
    div.dataset.postId = post.id;
    div.dataset.index = index;
    
    div.innerHTML = `
        <div class="post-content">
            <div class="post-header">
                <span class="post-author">${post.user_name || '匿名用户'}</span>
                <span class="post-time">${formatTime(post.created_at)}</span>
            </div>
            <div class="post-body">
                ${post.text_content ? `<p class="post-text">${post.text_content}</p>` : ''}
                ${post.image_url ? `<img src="${post.image_url}" alt="帖子图片" class="post-image">` : ''}
            </div>
            <div class="post-footer">
                <button class="post-action like-btn" onclick="handleLike(${post.id})">
                    👍 <span class="like-count">${post.likes_count || 0}</span>
                </button>
                <button class="post-action comment-btn" onclick="showComments(${post.id})">
                    💬 <span class="comment-count">${post.comments_count || 0}</span>
                </button>
            </div>
        </div>
    `;
    
    return div;
}

/**
 * 设置滑动处理
 */
function setupSwipeHandlers() {
    const posts = document.querySelectorAll('.swipe-post');
    
    posts.forEach(post => {
        let startX = 0;
        let startY = 0;
        let isDragging = false;

        post.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        });

        post.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;

            // 只处理水平滑动
            if (Math.abs(diffX) > Math.abs(diffY)) {
                post.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.1}deg)`;
                post.style.opacity = 1 - Math.abs(diffX) / 300;
            }
        });

        post.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.changedTouches[0].clientX;
            const diffX = endX - startX;

            // 滑动阈值：100px
            if (Math.abs(diffX) > 100) {
                if (diffX > 0) {
                    // 右滑 = 喜欢
                    handleSwipeRight(post);
                } else {
                    // 左滑 = 不喜欢
                    handleSwipeLeft(post);
                }
            } else {
                // 恢复原位置
                post.style.transform = '';
                post.style.opacity = '';
            }
        });
    });
}

/**
 * 右滑处理（喜欢）
 */
async function handleSwipeRight(postElement) {
    const postId = postElement.dataset.postId;
    console.log("👉 右滑 - 喜欢帖子:", postId);
    
    // 添加点赞
    await toggleLike(postId, true);
    
    // 动画移除
    postElement.style.transform = 'translateX(100vw) rotate(30deg)';
    postElement.style.opacity = '0';
    
    setTimeout(() => {
        postElement.remove();
        currentPostIndex++;
    }, 300);
}

/**
 * 左滑处理（不喜欢）
 */
function handleSwipeLeft(postElement) {
    const postId = postElement.dataset.postId;
    console.log("👈 左滑 - 不喜欢帖子:", postId);
    
    // 动画移除
    postElement.style.transform = 'translateX(-100vw) rotate(-30deg)';
    postElement.style.opacity = '0';
    
    setTimeout(() => {
        postElement.remove();
        currentPostIndex++;
    }, 300);
}

/**
 * 切换点赞状态
 */
async function toggleLike(postId, isLike) {
    const client = getSupabaseClient();
    if (!client) return;

    try {
        if (isLike) {
            const { error } = await client
                .from('likes')
                .insert({ post_id: postId, user_id: appState.user?.id });
            
            if (!error) {
                console.log("✅ 点赞成功");
            }
        } else {
            const { error } = await client
                .from('likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', appState.user?.id);
            
            if (!error) {
                console.log("✅ 取消点赞成功");
            }
        }
    } catch (err) {
        console.error("❌ 点赞操作失败:", err);
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

/**
 * 获取模拟数据
 */
function getMockPosts() {
    return [
        {
            id: 1,
            user_name: '用户A',
            text_content: '今天又是想辞职的一天 💩',
            likes_count: 23,
            comments_count: 5,
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            user_name: '用户B',
            text_content: '老板说今天要加班...',
            likes_count: 45,
            comments_count: 12,
            created_at: new Date().toISOString()
        }
    ];
}

// 导出到 window 供 HTML 调用
window.handleLike = async function(postId) {
    await toggleLike(postId, true);
    // 更新UI
    const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
    if (likeBtn) {
        const countEl = likeBtn.querySelector('.like-count');
        if (countEl) {
            countEl.textContent = parseInt(countEl.textContent) + 1;
        }
    }
};

window.showComments = function(postId) {
    console.log("显示评论:", postId);
    // 将在 comments.js 中实现
};

// 页面切换时初始化
window.addEventListener('swipePageActive', () => {
    initSwipeFeed();
});
