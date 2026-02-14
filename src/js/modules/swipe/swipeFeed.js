/**
 * 划一划发帖模块 - 滑动Feed功能
 * 处理帖子滑动、点赞/取消点赞等交互
 */

import { getSupabaseClient } from '../../supabase.js';
import { appState } from '../../state.js';

let currentPostIndex = 0;
let posts = [];

/**
 * Initialize swipe feed
 */
export async function initSwipeFeed() {
    console.log("Initializing swipe feed...");
    currentPostIndex = 0;
    await loadPosts();
    renderPosts();
}

/**
 * Refresh feed (used after posting)
 */
export async function refreshSwipeFeed() {
    console.log("Refreshing swipe feed...");
    currentPostIndex = 0;
    await loadPosts();
    renderPosts();
}

/**
 * Load posts list
 */
async function loadPosts() {
    const client = getSupabaseClient();
    if (!client) {
        console.warn("Supabase not ready, using mock data");
        posts = getMockPosts();
        return;
    }

    try {
        const { data: postsData, error: postsError } = await client
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (postsError) {
            throw postsError;
        }

        // 直接使用 posts 表中的 user_name 和 user_email 字段，不再查询 users 表
        posts = (postsData || []).map(post => ({
            ...post,
            user: {
                id: post.user_id,
                name: post.user_name || post.user_email?.split('@')[0] || 'Anonymous',
                email: post.user_email
            }
        }));
        
        console.log(`Loaded ${posts.length} posts`);
    } catch (err) {
        console.error("Failed to load posts:", err);
        posts = getMockPosts();
    }
}

/**
 * Render posts list (card style, show one at a time)
 */
function renderPosts() {
    const feedContainer = document.getElementById('contentFeed');
    if (!feedContainer) return;

    feedContainer.innerHTML = '';

    if (posts.length === 0) {
        feedContainer.innerHTML = '<div class="no-posts">No posts yet, go create one~</div>';
        return;
    }

    const postElement = createPostElement(posts[0], 0);
    feedContainer.appendChild(postElement);
    
    setupSwipeHandlers();
}

/**
 * Create post element (card style)
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
                    <span class="post-author">${post.user_name || post.user?.name || 'Anonymous'}</span>
                    <span class="post-time">${formatTime(post.created_at)}</span>
                </div>
            </div>
            <div class="post-body">
                ${post.text_content ? `<p class="post-text">${post.text_content}</p>` : ''}
                ${post.image_url ? `<img src="${post.image_url}" alt="Post image" class="post-image" loading="lazy">` : ''}
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
 * Setup swipe handlers (touch and mouse support)
 */
function setupSwipeHandlers() {
    const post = document.querySelector('.swipe-post');
    if (!post) return;
    
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let isDragging = false;
    let swipeDirection = null;

    post.addEventListener('touchstart', handleStart, { passive: true });
    post.addEventListener('touchmove', handleMove, { passive: true });
    post.addEventListener('touchend', handleEnd);

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
        
        post.classList.add('dragging');
    }

    function handleMove(e) {
        if (!isDragging) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const diffX = clientX - startX;
        const diffY = clientY - startY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
            e.preventDefault();
            currentX = clientX;
            
            const rotate = diffX * 0.1;
            const opacity = 1 - Math.abs(diffX) / 300;
            
            post.style.transform = `translateX(${diffX}px) rotate(${rotate}deg)`;
            post.style.opacity = Math.max(opacity, 0.3);
            
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

        if (Math.abs(diffX) > 100) {
            if (diffX > 0) {
                handleSwipeRight(post);
            } else {
                handleSwipeLeft(post);
            }
        } else {
            post.style.transform = '';
            post.style.opacity = '';
            hideSwipeHint(post);
        }
        
        swipeDirection = null;
    }
}

/**
 * Show swipe hint
 */
function showSwipeHint(postElement, direction) {
    let hint = postElement.querySelector('.swipe-hint');
    if (!hint) {
        hint = document.createElement('div');
        hint.className = 'swipe-hint';
        postElement.appendChild(hint);
    }
    
    if (direction === 'like') {
        hint.textContent = '👍 Like';
        hint.className = 'swipe-hint swipe-hint-like';
    } else {
        hint.textContent = '👎 Dislike';
        hint.className = 'swipe-hint swipe-hint-dislike';
    }
}

/**
 * Hide swipe hint
 */
function hideSwipeHint(postElement) {
    const hint = postElement.querySelector('.swipe-hint');
    if (hint) {
        hint.remove();
    }
}

/**
 * Handle swipe right (like)
 */
async function handleSwipeRight(postElement) {
    const postId = postElement.dataset.postId;
    console.log("Swipe right - like post:", postId);
    
    await toggleLike(postId, true);
    
    showSwipeAnimation(postElement, 'like');
    
    postElement.style.transform = 'translateX(100vw) rotate(30deg)';
    postElement.style.opacity = '0';
    
    setTimeout(() => {
        postElement.remove();
        currentPostIndex++;
        loadNextPost();
    }, 300);
}

/**
 * Handle swipe left (dislike)
 */
function handleSwipeLeft(postElement) {
    const postId = postElement.dataset.postId;
    console.log("Swipe left - dislike post:", postId);
    
    showSwipeAnimation(postElement, 'dislike');
    
    postElement.style.transform = 'translateX(-100vw) rotate(-30deg)';
    postElement.style.opacity = '0';
    
    setTimeout(() => {
        postElement.remove();
        currentPostIndex++;
        loadNextPost();
    }, 300);
}

/**
 * Show swipe animation
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
 * Load next post
 */
function loadNextPost() {
    currentPostIndex++;
    
    if (currentPostIndex >= posts.length) {
        const feedContainer = document.getElementById('contentFeed');
        if (feedContainer) {
            feedContainer.innerHTML = '<div class="no-more-posts">No more posts~</div>';
        }
        return;
    }
    
    const feedContainer = document.getElementById('contentFeed');
    if (feedContainer && posts[currentPostIndex]) {
        const postElement = createPostElement(posts[currentPostIndex], currentPostIndex);
        feedContainer.appendChild(postElement);
        setupSwipeHandlers();
    }
}

/**
 * Toggle like status
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
                console.log("Like success");
            }
        } else {
            const { error } = await client
                .from('likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', appState.user?.id);
            
            if (!error) {
                console.log("Unlike success");
            }
        }
    } catch (err) {
        console.error("Like operation failed:", err);
    }
}

/**
 * Format time
 */
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

/**
 * Get mock data
 */
function getMockPosts() {
    return [
        {
            id: 1,
            user_name: 'User A',
            text_content: 'Another day of wanting to quit my job',
            likes_count: 23,
            comments_count: 5,
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            user_name: 'User B',
            text_content: 'Boss said we need to work overtime today...',
            likes_count: 45,
            comments_count: 12,
            created_at: new Date().toISOString()
        }
    ];
}

window.handleLike = async function(postId) {
    await toggleLike(postId, true);
    const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn`);
    if (likeBtn) {
        const countEl = likeBtn.querySelector('.like-count');
        if (countEl) {
            countEl.textContent = parseInt(countEl.textContent) + 1;
        }
    }
};

window.showComments = function(postId) {
    console.log("Show comments:", postId);
};

window.initSwipeFeed = initSwipeFeed;
window.refreshSwipeFeed = refreshSwipeFeed;

// 页面切换时初始化
window.addEventListener('swipePageActive', () => {
    initSwipeFeed();
});
