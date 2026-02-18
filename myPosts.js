/**
 * myPosts.js - 我的帖子列表和管理模块
 * BOSS KILL 项目
 */

// 我的帖子数据
const myPostsData = {
    posts: [],
    likes: [],
    favorites: [],
    currentTab: 'posts',
    currentPage: 1,
    pageSize: 20,
    hasMore: true,
    loading: false
};

// 帖子数据结构
class Post {
    constructor(data) {
        this.id = data.id;
        this.userId = data.user_id;
        this.content = data.content;
        this.imageUrl = data.image_url;
        this.emoji = data.emoji;
        this.tags = data.tags || [];
        this.likesCount = data.likes_count || 0;
        this.commentsCount = data.comments_count || 0;
        this.sharesCount = data.shares_count || 0;
        this.isLiked = data.is_liked || false;
        this.isFavorited = data.is_favorited || false;
        this.createdAt = new Date(data.created_at);
        this.updatedAt = new Date(data.updated_at);
    }

    getTimeAgo() {
        const now = new Date();
        const diff = now - this.createdAt;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        return this.createdAt.toLocaleDateString('zh-CN');
    }
}

/**
 * 进入我的主页
 */
async function goToMyHomepage() {
    try {
        showLoading('加载中...');
        
        // 模拟API调用
        const userData = {
            user_id: 'user_001',
            name: '游客用户',
            avatar: '👤',
            bio: '这个人很懒，什么都没留下~',
            location: '地球',
            join_date: '2024年1月',
            stats: {
                posts: 12,
                followers: 128,
                following: 56,
                likes: 1200
            }
        };

        updateHomepageInfo(userData);
        
        // 重置分页状态
        myPostsData.currentPage = 1;
        myPostsData.hasMore = true;
        
        // 加载帖子
        await loadMyPosts('posts');
        
        // 切换到主页
        if (typeof switchPage === 'function') {
            switchPage('myHomepage');
        }
    } catch (error) {
        console.error('加载主页失败:', error);
        showToast('加载失败，请重试');
    } finally {
        hideLoading();
    }
}

/**
 * 更新主页信息显示
 */
function updateHomepageInfo(data) {
    const elements = {
        homepageAvatar: data.avatar,
        homepageName: data.name,
        homepageBio: data.bio,
        homepageLocation: data.location,
        homepageJoinDate: data.join_date,
        hpPosts: data.stats.posts,
        hpFollowers: formatNumber(data.stats.followers),
        hpFollowing: formatNumber(data.stats.following),
        hpLikes: formatNumber(data.stats.likes)
    };

    Object.keys(elements).forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.textContent = elements[id];
    });
}

/**
 * 格式化数字显示
 */
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

/**
 * 加载我的帖子列表
 */
async function loadMyPosts(tab = 'posts', append = false) {
    if (myPostsData.loading) return;
    
    try {
        myPostsData.loading = true;
        myPostsData.currentTab = tab;
        
        // 模拟API数据
        const mockPosts = generateMockPosts(tab);
        const posts = mockPosts.map(p => new Post(p));
        
        if (append) {
            myPostsData[tab].push(...posts);
        } else {
            myPostsData[tab] = posts;
        }
        
        myPostsData.hasMore = myPostsData.currentPage < 5;
        renderMyPosts(myPostsData[tab], tab);
        
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = myPostsData.hasMore ? 'block' : 'none';
        }
    } catch (error) {
        console.error('加载帖子失败:', error);
        showToast('加载失败，请重试');
    } finally {
        myPostsData.loading = false;
    }
}

/**
 * 生成模拟帖子数据
 */
function generateMockPosts(tab) {
    const mockData = {
        posts: [
            { 
                id: 'p1', 
                user_id: 'user_001',
                content: '今天又被老板骂了，不过没关系，我已经在BOSS KILL里扔了100个便便发泄了！', 
                emoji: '👔',
                tags: ['老板', '吐槽'],
                likes_count: 328, 
                comments_count: 45, 
                shares_count: 12,
                is_liked: false,
                created_at: new Date(Date.now() - 2 * 3600000).toISOString()
            },
            { 
                id: 'p2', 
                user_id: 'user_001',
                content: '刚刚占领了一栋写字楼！屎塔高度已经超过50米了',
                emoji: '🏢',
                tags: ['屎塔', '成就'],
                likes_count: 892, 
                comments_count: 156, 
                shares_count: 67,
                is_liked: true,
                created_at: new Date(Date.now() - 86400000).toISOString()
            }
        ],
        likes: [
            { 
                id: 'p3', 
                user_id: 'other_user',
                content: '办公室摸鱼指南：如何优雅地度过996',
                emoji: '🐟',
                tags: ['摸鱼'],
                likes_count: 1520, 
                comments_count: 234,
                is_liked: true,
                created_at: new Date(Date.now() - 172800000).toISOString()
            }
        ],
        favorites: [
            { 
                id: 'p4', 
                user_id: 'other_user',
                content: '画了一个我们部门经理的样子',
                emoji: '🤓',
                tags: ['绘画'],
                likes_count: 1205,
                is_favorited: true,
                created_at: new Date(Date.now() - 259200000).toISOString()
            }
        ]
    };
    
    return mockData[tab] || [];
}

/**
 * 渲染帖子列表
 */
function renderMyPosts(posts, tab) {
    const container = document.getElementById('homepagePosts');
    if (!container) return;
    
    if (!posts || posts.length === 0) {
        container.innerHTML = renderEmptyState(tab);
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="post-item" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar">${post.emoji || '👤'}</div>
                <div class="post-user-info">
                    <div class="post-username">游客用户</div>
                    <div class="post-time">${post.getTimeAgo()}</div>
                </div>
                <div class="post-menu" onclick="showPostMenu('${post.id}')">⋮</div>
            </div>
            <div class="post-content">
                <div class="post-text">${escapeHtml(post.content)}</div>
                ${post.emoji ? `<div class="post-image">${post.emoji}</div>` : ''}
                ${post.tags.length > 0 ? `
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="post-actions">
                <div class="post-action ${post.isLiked ? 'liked' : ''}" onclick="likePost('${post.id}')">
                    <span class="action-icon">${post.isLiked ? '❤️' : '🤍'}</span>
                    <span class="action-count">${post.likesCount}</span>
                </div>
                <div class="post-action" onclick="showComments('${post.id}')">
                    <span class="action-icon">💬</span>
                    <span class="action-count">${post.commentsCount}</span>
                </div>
                <div class="post-action" onclick="sharePost('${post.id}')">
                    <span class="action-icon">🔄</span>
                    <span class="action-count">${post.sharesCount}</span>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * 渲染空状态
 */
function renderEmptyState(tab) {
    const emptyStates = {
        posts: { emoji: '📝', text: '还没有发布任何帖子' },
        likes: { emoji: '❤️', text: '还没有喜欢的内容' },
        favorites: { emoji: '⭐', text: '还没有收藏的内容' }
    };
    
    const state = emptyStates[tab];
    return `
        <div class="empty-state">
            <div class="empty-state-emoji">${state.emoji}</div>
            <div class="empty-state-text">${state.text}</div>
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
 * 切换主页标签
 */
function switchHomepageTab(tab, elem) {
    document.querySelectorAll('.hp-tab').forEach(t => t.classList.remove('active'));
    if (elem && elem.classList) {
        elem.classList.add('active');
    }
    
    myPostsData.currentPage = 1;
    myPostsData.hasMore = true;
    loadMyPosts(tab);
}

/**
 * 点赞帖子
 * API: POST /api/action/record
 * 数据库: user_actions 表, action_type = 'like'
 */
async function likePost(postId) {
    const post = findPostById(postId);
    if (!post) return;
    
    const isLiked = post.isLiked;
    
    // 乐观更新UI
    post.isLiked = !isLiked;
    post.likesCount += isLiked ? -1 : 1;
    updatePostLikeUI(postId, post.isLiked, post.likesCount);
    
    // 调用API记录行为（会自动奖励积分）
    try {
        // 模拟API调用 api_action_record
        // 实际应该调用: POST /api/action/record
        // 参数: user_id, content_id, action_type='like', action_value=1
        console.log('API调用: api_action_record', {
            user_id: 'user_001',
            content_id: postId,
            action_type: isLiked ? 'unlike' : 'like',
            action_value: 1
        });
    } catch (error) {
        console.error('记录点赞行为失败:', error);
    }
    
    showToast(isLiked ? '已取消点赞' : '点赞成功');
}

/**
 * 更新帖子点赞UI
 */
function updatePostLikeUI(postId, isLiked, count) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (!postElement) return;
    
    const likeAction = postElement.querySelector('.post-action');
    const likeIcon = likeAction.querySelector('.action-icon');
    const likeCount = likeAction.querySelector('.action-count');
    
    if (isLiked) {
        likeAction.classList.add('liked');
        likeIcon.textContent = '❤️';
    } else {
        likeAction.classList.remove('liked');
        likeIcon.textContent = '🤍';
    }
    
    likeCount.textContent = count;
}

/**
 * 显示评论
 */
function showComments(postId) {
    showToast('评论功能开发中');
}

/**
 * 分享帖子
 */
async function sharePost(postId) {
    showToast('分享链接已复制');
}

/**
 * 显示帖子菜单
 */
function showPostMenu(postId) {
    if (confirm('确定要删除这条帖子吗？')) {
        deletePost(postId);
    }
}

/**
 * 删除帖子
 */
function deletePost(postId) {
    myPostsData.posts = myPostsData.posts.filter(p => p.id !== postId);
    renderMyPosts(myPostsData.posts, 'posts');
    showToast('删除成功');
}

/**
 * 根据ID查找帖子
 */
function findPostById(postId) {
    const allPosts = [
        ...myPostsData.posts,
        ...myPostsData.likes,
        ...myPostsData.favorites
    ];
    return allPosts.find(p => p.id === postId);
}

/**
 * 加载更多帖子
 */
async function loadMorePosts() {
    if (!myPostsData.hasMore || myPostsData.loading) return;
    
    myPostsData.currentPage++;
    await loadMyPosts(myPostsData.currentTab, true);
}

// 工具函数（如果主页面没有定义）
if (typeof showToast !== 'function') {
    window.showToast = function(message) {
        alert(message);
    };
}

if (typeof showLoading !== 'function') {
    window.showLoading = function(message) {
        console.log('Loading:', message);
    };
}

if (typeof hideLoading !== 'function') {
    window.hideLoading = function() {
        console.log('Loading complete');
    };
}

console.log('✅ myPosts.js 模块已加载');

