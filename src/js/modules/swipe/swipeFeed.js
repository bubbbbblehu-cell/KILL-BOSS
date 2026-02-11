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
    currentPostIndex = 0; // 重置索引
    await loadPosts();
    renderPosts();
}

/**
 * 刷新Feed（用于发帖后更新）
 */
export async function refreshSwipeFeed() {
    console.log("🔄 刷新滑动Feed...");
    currentPostIndex = 0;
    await loadPosts();
    renderPosts();
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
        // 先查询帖子，然后单独查询用户信息
        const { data: postsData, error: postsError } = await client
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (postsError) {
            throw postsError;
        }

        // 获取所有唯一的用户ID
        const userIds = [...new Set((postsData || []).map(p => p.user_id))];
        
        // 查询用户信息（如果 users 表不存在，使用默认值）
        let usersMap = {};
        if (userIds.length > 0) {
            try {
                const { data: usersData, error: usersError } = await client
                    .from('users')
                    .select('id, name, email, avatar_url')
                    .in('id', userIds);
                
                if (!usersError && usersData) {
                    usersMap = usersData.reduce((acc, user) => {
                        acc[user.id] = user;
                        return acc;
                    }, {});
                }
            } catch (usersErr) {
                console.warn("⚠️ 查询用户信息失败（users 表可能不存在）:", usersErr);
                // 继续执行，使用默认用户信息
            }
        }

        // 合并数据
        posts = (postsData || []).map(post => ({
            ...post,
            user: usersMap[post.user_id] || {
                id: post.user_id,
                name: post.user_id.split('-')[0] || '用户',
                email: null
            }
        }));
        
        console.log(`✅ 加载了 ${posts.length} 条帖子`);
    } catch (err) {
        console.error("❌ 加载帖子异常:", err);
        posts = getMockPosts();
    }
}

/**
 * 渲染帖子列表（卡片式，一次显示一个）
 */
function renderPosts() {
    const feedContainer = document.getElementById('contentFeed');
    if (!feedContainer) return;

    feedContainer.innerHTML = '';

    if (posts.length === 0) {
        feedContainer.innerHTML = '<div class="no-posts">暂无帖子，快去发一个吧~</div>';
        return;
    }

    // 只显示第一个帖子（卡片式）
    const postElement = createPostElement(posts[0], 0);
    feedContainer.appendChild(postElement);
    
    // 设置滑动处理
    setupSwipeHandlers();
}

/**
 * 创建帖子元素（卡片式）
 */
function createPostElement(post, index) {
    const div = document.createElement('div');
    div.className = 'swipe-post';
    div.dataset.postId = post.id;
    div.dataset.index = index;
    
    div.innerHTML = `
        <div class="post-content">
            <div class="post-header">
                <div class="post-author-info">
                    <span class="post-author">${post.user_name || post.user?.name || '匿名用户'}</span>
                    <span class="post-time">${formatTime(post.created_at)}</span>
                </div>
            </div>
            <div class="post-body">
                ${post.text_content ? `<p class="post-text">${post.text_content}</p>` : ''}
                ${post.image_url ? `<img src="${post.image_url}" alt="帖子图片" class="post-image" loading="lazy">` : ''}
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
 * 设置滑动处理（支持触摸和鼠标）
 */
function setupSwipeHandlers() {
    const post = document.querySelector('.swipe-post');
    if (!post) return;
    
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let isDragging = false;
    let swipeDirection = null; // 'like' or 'dislike'

    // 触摸事件（移动端）
    post.addEventListener('touchstart', handleStart, { passive: true });
    post.addEventListener('touchmove', handleMove, { passive: true });
    post.addEventListener('touchend', handleEnd);

    // 鼠标事件（桌面端）
    post.addEventListener('mousedown', handleStart);
    post.addEventListener('mousemove', handleMove);
    post.addEventListener('mouseup', handleEnd);
    post.addEventListener('mouseleave', handleEnd);

    function handleStart(e) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        currentX = clientX;
        isDragging = true;
        post.style.transition = 'none';
        
        // 添加拖拽样式
        post.classList.add('dragging');
    }

    function handleMove(e) {
        if (!isDragging) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const diffX = clientX - startX;
        const diffY = clientY - startY;

        // 只处理水平滑动（水平距离大于垂直距离）
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
            e.preventDefault();
            currentX = clientX;
            
            const rotate = diffX * 0.1;
            const opacity = 1 - Math.abs(diffX) / 300;
            
            post.style.transform = `translateX(${diffX}px) rotate(${rotate}deg)`;
            post.style.opacity = Math.max(opacity, 0.3);
            
            // 显示提示
            if (diffX > 50) {
                swipeDirection = 'like';
                showSwipeHint(post, 'like');
            } else if (diffX < -50) {
                swipeDirection = 'dislike';
                showSwipeHint(post, 'dislike');
            } else {
                swipeDirection = null;
                hideSwipeHint(post);
            }
        }
    }

    function handleEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        post.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        post.classList.remove('dragging');
        
        const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
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
            hideSwipeHint(post);
        }
        
        swipeDirection = null;
    }
}

/**
 * 显示滑动提示
 */
function showSwipeHint(postElement, direction) {
    let hint = postElement.querySelector('.swipe-hint');
    if (!hint) {
        hint = document.createElement('div');
        hint.className = 'swipe-hint';
        postElement.appendChild(hint);
    }
    
    if (direction === 'like') {
        hint.textContent = '👍 喜欢';
        hint.className = 'swipe-hint swipe-hint-like';
    } else {
        hint.textContent = '👎 不喜欢';
        hint.className = 'swipe-hint swipe-hint-dislike';
    }
}

/**
 * 隐藏滑动提示
 */
function hideSwipeHint(postElement) {
    const hint = postElement.querySelector('.swipe-hint');
    if (hint) {
        hint.remove();
    }
}

/**
 * 右滑处理（喜欢）
 */
async function handleSwipeRight(postElement) {
    const postId = postElement.dataset.postId;
    console.log("👉 右滑 - 喜欢帖子:", postId);
    
    // 添加点赞
    await toggleLike(postId, true);
    
    // 显示喜欢动画
    showSwipeAnimation(postElement, 'like');
    
    // 动画移除
    postElement.style.transform = 'translateX(100vw) rotate(30deg)';
    postElement.style.opacity = '0';
    
    setTimeout(() => {
        postElement.remove();
        currentPostIndex++;
        loadNextPost();
    }, 300);
}

/**
 * 左滑处理（不喜欢）
 */
function handleSwipeLeft(postElement) {
    const postId = postElement.dataset.postId;
    console.log("👈 左滑 - 不喜欢帖子:", postId);
    
    // 显示不喜欢动画
    showSwipeAnimation(postElement, 'dislike');
    
    // 动画移除
    postElement.style.transform = 'translateX(-100vw) rotate(-30deg)';
    postElement.style.opacity = '0';
    
    setTimeout(() => {
        postElement.remove();
        currentPostIndex++;
        loadNextPost();
    }, 300);
}

/**
 * 显示滑动动画
 */
function showSwipeAnimation(postElement, direction) {
    const animation = document.createElement('div');
    animation.className = `swipe-animation swipe-animation-${direction}`;
    animation.textContent = direction === 'like' ? '👍' : '👎';
    postElement.appendChild(animation);
    
    setTimeout(() => {
        animation.remove();
    }, 500);
}

/**
 * 加载下一个帖子
 */
function loadNextPost() {
    currentPostIndex++;
    
    if (currentPostIndex >= posts.length) {
        // 没有更多帖子了
        const feedContainer = document.getElementById('contentFeed');
        if (feedContainer) {
            feedContainer.innerHTML = '<div class="no-more-posts">没有更多帖子了~</div>';
        }
        return;
    }
    
    // 渲染下一个帖子
    const feedContainer = document.getElementById('contentFeed');
    if (feedContainer && posts[currentPostIndex]) {
        const postElement = createPostElement(posts[currentPostIndex], currentPostIndex);
        feedContainer.appendChild(postElement);
        setupSwipeHandlers();
    }
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

window.initSwipeFeed = initSwipeFeed;
window.refreshSwipeFeed = refreshSwipeFeed;

// 页面切换时初始化
window.addEventListener('swipePageActive', () => {
    initSwipeFeed();
});
