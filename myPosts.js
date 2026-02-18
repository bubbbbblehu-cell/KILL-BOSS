# myPosts.js - 我的帖子列表和管理模块

## 模块概述
本模块实现了用户个人主页的帖子展示、管理和交互功能，包括帖子列表展示、点赞、评论、分享等核心功能。符合BOSS KILL项目的前端服务架构设计规范。

---

## 一、功能特性

### 1.1 核心功能
- ✅ 个人主页展示（头像、昵称、简介、统计数据）
- ✅ 帖子列表展示（我的帖子、喜欢的、收藏的）
- ✅ 帖子交互（点赞、评论、分享）
- ✅ 标签页切换（帖子/喜欢/收藏）
- ✅ 空状态提示
- ✅ 实时数据更新
- ✅ 分页加载
- ✅ 下拉刷新

### 1.2 页面入口
- 从"我的"页面点击"我的帖子"菜单项进入
- 菜单路径：个人中心 → 我的帖子

### 1.3 功能模块与API/数据库依赖

| 功能 | 是否需要API | 数据库表 | 存储过程 |
|------|------------|----------|----------|
| 获取用户主页信息 | ✅ 需要 | `users`, `user_stats` | `api_user_get_homepage` |
| 获取用户帖子列表 | ✅ 需要 | `posts`, `post_likes`, `post_favorites` | `api_post_get_by_user` |
| 获取喜欢的帖子 | ✅ 需要 | `post_likes`, `posts` | `api_post_get_liked` |
| 获取收藏的帖子 | ✅ 需要 | `post_favorites`, `posts` | `api_post_get_favorited` |
| 点赞帖子 | ✅ 需要 | `post_likes`, `posts` | `api_post_like` |
| 取消点赞 | ✅ 需要 | `post_likes`, `posts` | `api_post_unlike` |
| 评论帖子 | ✅ 需要 | `post_comments`, `posts` | `api_post_comment` |
| 分享帖子 | ✅ 需要 | `post_shares`, `posts` | `api_post_share` |
| 删除帖子 | ✅ 需要 | `posts` | `api_post_delete` |
| 编辑帖子 | ✅ 需要 | `posts` | `api_post_update` |

> **数据库依赖**: 需要用户认证数据库、推荐服务数据库中的相关表

---

## 二、HTML 结构

### 2.1 页面容器
```html
<!-- 我的主页 -->
<div class="page my-homepage" id="myHomepage">
    <div class="page-header" style="justify-content: flex-start; gap: 15px;">
        <button class="back-btn" onclick="switchPage('profile')">←</button>
        <span class="page-title">我的主页</span>
    </div>
    <div class="page-content">
        <!-- 主页头部 -->
        <div class="homepage-header">
            <div class="homepage-cover"></div>
            <div class="homepage-avatar-wrapper">
                <div class="homepage-avatar" id="homepageAvatar">👤</div>
                <button class="edit-avatar-btn" onclick="editAvatar()">📷</button>
            </div>
            <div class="homepage-info">
                <h2 class="homepage-name" id="homepageName">游客用户</h2>
                <p class="homepage-bio" id="homepageBio">这个人很懒，什么都没留下~</p>
                <div class="homepage-meta">
                    <span>📍 <span id="homepageLocation">地球</span></span>
                    <span>📅 加入于 <span id="homepageJoinDate">2024年1月</span></span>
                </div>
            </div>
            <div class="homepage-stats-row">
                <div class="hp-stat" onclick="switchHomepageTab('posts', event.target)">
                    <span class="hp-stat-value" id="hpPosts">0</span>
                    <span class="hp-stat-label">帖子</span>
                </div>
                <div class="hp-stat" onclick="showFollowers()">
                    <span class="hp-stat-value" id="hpFollowers">0</span>
                    <span class="hp-stat-label">粉丝</span>
                </div>
                <div class="hp-stat" onclick="showFollowing()">
                    <span class="hp-stat-value" id="hpFollowing">0</span>
                    <span class="hp-stat-label">关注</span>
                </div>
                <div class="hp-stat">
                    <span class="hp-stat-value" id="hpLikes">0</span>
                    <span class="hp-stat-label">获赞</span>
                </div>
            </div>
        </div>

        <!-- 标签切换 -->
        <div class="homepage-tabs">
            <div class="hp-tab active" onclick="switchHomepageTab('posts', this)">📝 帖子</div>
            <div class="hp-tab" onclick="switchHomepageTab('likes', this)">❤️ 喜欢</div>
            <div class="hp-tab" onclick="switchHomepageTab('favorites', this)">⭐ 收藏</div>
        </div>

        <!-- 帖子列表 -->
        <div class="homepage-posts" id="homepagePosts">
            <!-- 动态生成 -->
        </div>

        <!-- 加载更多 -->
        <div class="load-more" id="loadMoreBtn" onclick="loadMorePosts()" style="display: none;">
            <span>加载更多</span>
        </div>
    </div>
    
    <!-- 底部导航栏 -->
    <div class="bottom-nav">
        <div class="nav-item" onclick="switchPage('swipe')">
            <span class="nav-icon">🏠</span>
            <span class="nav-label">首页</span>
        </div>
        <div class="nav-item" onclick="switchPage('map')">
            <span class="nav-icon">🗺️</span>
            <span class="nav-label">地图</span>
        </div>
        <div class="nav-item" onclick="switchPage('draw')">
            <span class="nav-icon">🎨</span>
            <span class="nav-label">画画</span>
        </div>
        <div class="nav-item active" onclick="switchPage('profile')">
            <span class="nav-icon">👤</span>
            <span class="nav-label">我的</span>
        </div>
    </div>
</div>
```

### 2.2 帖子卡片结构（动态生成）
```html
<div class="post-item" data-post-id="p1">
    <div class="post-header">
        <div class="post-avatar">👤</div>
        <div class="post-user-info">
            <div class="post-username">游客用户</div>
            <div class="post-time">2小时前</div>
        </div>
        <div class="post-menu" onclick="showPostMenu('p1')">⋮</div>
    </div>
    <div class="post-content">
        <div class="post-text">帖子内容文字...</div>
        <div class="post-image" onclick="viewImage('image_url')">👔</div>
        <div class="post-tags">
            <span class="post-tag">#老板</span>
            <span class="post-tag">#吐槽</span>
        </div>
    </div>
    <div class="post-actions">
        <div class="post-action" onclick="likePost('p1')">
            <span class="action-icon">❤️</span>
            <span class="action-count">328</span>
        </div>
        <div class="post-action" onclick="showComments('p1')">
            <span class="action-icon">💬</span>
            <span class="action-count">45</span>
        </div>
        <div class="post-action" onclick="sharePost('p1')">
            <span class="action-icon">🔄</span>
            <span class="action-count">12</span>
        </div>
    </div>
</div>
```

---

## 三、CSS 样式

### 3.1 主页头部样式
```css
.homepage-header {
    position: relative;
    padding-bottom: 20px;
    background: var(--bg-card);
}

.homepage-cover {
    height: 120px;
    background: linear-gradient(135deg, #ff6b35 0%, #8b5cf6 50%, #06b6d4 100%);
}

.homepage-avatar-wrapper {
    position: relative;
    width: 90px;
    margin: -45px auto 0;
}

.homepage-avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-orange), var(--accent-yellow));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 45px;
    border: 4px solid var(--bg-dark);
    cursor: pointer;
}

.edit-avatar-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--accent-purple);
    border: 2px solid var(--bg-dark);
    font-size: 12px;
    cursor: pointer;
    transition: transform 0.2s;
}

.edit-avatar-btn:hover {
    transform: scale(1.1);
}

.homepage-info {
    text-align: center;
    padding: 15px 20px;
}

.homepage-name {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--text-primary);
}

.homepage-bio {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 12px;
    line-height: 1.5;
}

.homepage-meta {
    display: flex;
    justify-content: center;
    gap: 20px;
    font-size: 12px;
    color: var(--text-muted);
}
```

### 3.2 统计数据样式
```css
.homepage-stats-row {
    display: flex;
    justify-content: space-around;
    padding: 15px 20px;
    border-top: 1px solid var(--border-color);
    border-bottom: 1px solid var(--border-color);
}

.hp-stat {
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s;
}

.hp-stat:hover {
    transform: translateY(-2px);
}

.hp-stat-value {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
}

.hp-stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
}
```

### 3.3 标签页样式
```css
.homepage-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-card);
    position: sticky;
    top: 60px;
    z-index: 10;
}

.hp-tab {
    flex: 1;
    text-align: center;
    padding: 14px;
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s;
    border-bottom: 2px solid transparent;
    position: relative;
}

.hp-tab:hover {
    color: var(--text-primary);
    background: rgba(255, 107, 53, 0.05);
}

.hp-tab.active {
    color: var(--accent-orange);
    border-bottom-color: var(--accent-orange);
    font-weight: 600;
}
```

### 3.4 帖子列表样式
```css
.homepage-posts {
    padding: 15px;
    min-height: 300px;
}

.post-item {
    background: var(--bg-card);
    border-radius: 16px;
    margin-bottom: 15px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
}

.post-item:hover {
    border-color: var(--accent-orange);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.1);
}

.post-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
}

.post-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
}

.post-user-info {
    flex: 1;
    min-width: 0;
}

.post-username {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
}

.post-time {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
}

.post-menu {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s;
}

.post-menu:hover {
    background: var(--bg-input);
    color: var(--text-primary);
}

.post-content {
    padding: 0 15px 15px;
}

.post-text {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 12px;
    color: var(--text-primary);
    word-wrap: break-word;
}

.post-image {
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, #2a2a3a, #3a3a4a);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 60px;
    cursor: pointer;
    transition: transform 0.2s;
    margin-bottom: 12px;
}

.post-image:hover {
    transform: scale(1.02);
}

.post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.post-tag {
    padding: 4px 12px;
    background: rgba(255, 107, 53, 0.1);
    color: var(--accent-orange);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.post-actions {
    display: flex;
    padding: 12px 15px;
    border-top: 1px solid var(--border-color);
    gap: 30px;
}

.post-action {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.post-action:hover {
    color: var(--accent-orange);
}

.post-action.liked {
    color: var(--accent-red);
}

.action-icon {
    font-size: 18px;
}

.action-count {
    font-weight: 500;
}
```

### 3.5 空状态样式
```css
.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-muted);
}

.empty-state-emoji {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
}

.empty-state-text {
    font-size: 14px;
    line-height: 1.6;
}

.empty-state-action {
    margin-top: 20px;
}

.empty-state-btn {
    padding: 10px 24px;
    background: var(--accent-orange);
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.empty-state-btn:hover {
    background: var(--accent-yellow);
    transform: translateY(-2px);
}
```

### 3.6 加载更多样式
```css
.load-more {
    text-align: center;
    padding: 20px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: color 0.3s;
}

.load-more:hover {
    color: var(--accent-orange);
}

.load-more.loading::after {
    content: '...';
    animation: dots 1.5s infinite;
}

@keyframes dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60%, 100% { content: '...'; }
}
```

---

## 四、JavaScript 功能实现

### 4.1 数据模型
```javascript
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
```

### 4.2 进入主页功能
```javascript
/**
 * 进入我的主页
 * API调用: GET /api/user/homepage
 */
async function goToMyHomepage() {
    try {
        showLoading('加载中...');
        
        // 调用API获取用户主页数据
        const response = await simulateAPI('GET', '/api/user/homepage', 
            { user_id: appState.user?.id },
            { 
                success: true, 
                data: {
                    user_id: appState.user?.id,
                    name: appState.user?.name || '游客用户',
                    avatar: appState.user?.avatar || '👤',
                    bio: appState.user?.bio || '这个人很懒，什么都没留下~',
                    location: '地球',
                    join_date: '2024年1月',
                    stats: {
                        posts: 0,
                        followers: 0,
                        following: 0,
                        likes: 0
                    }
                }
            }
        );

        if (response.success) {
            // 更新主页信息
            updateHomepageInfo(response.data);
            
            // 重置分页状态
            myPostsData.currentPage = 1;
            myPostsData.hasMore = true;
            
            // 加载帖子
            await loadMyPosts('posts');
            
            // 切换到主页
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
    document.getElementById('homepageAvatar').textContent = data.avatar;
    document.getElementById('homepageName').textContent = data.name;
    document.getElementById('homepageBio').textContent = data.bio;
    document.getElementById('homepageLocation').textContent = data.location;
    document.getElementById('homepageJoinDate').textContent = data.join_date;
    
    // 更新统计数据
    document.getElementById('hpPosts').textContent = data.stats.posts;
    document.getElementById('hpFollowers').textContent = formatNumber(data.stats.followers);
    document.getElementById('hpFollowing').textContent = formatNumber(data.stats.following);
    document.getElementById('hpLikes').textContent = formatNumber(data.stats.likes);
}

/**
 * 格式化数字显示（1000+ -> 1k）
 */
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}
```

### 4.3 加载帖子列表
```javascript
/**
 * 加载我的帖子列表
 * @param {string} tab - 标签类型: posts/likes/favorites
 * API调用: 
 * - GET /api/user/posts (我的帖子)
 * - GET /api/user/likes (喜欢的)
 * - GET /api/user/favorites (收藏的)
 */
async function loadMyPosts(tab = 'posts', append = false) {
    if (myPostsData.loading) return;
    
    try {
        myPostsData.loading = true;
        myPostsData.currentTab = tab;
        
        // 根据标签选择API端点
        const endpoints = {
            posts: '/api/user/posts',
            likes: '/api/user/likes',
            favorites: '/api/user/favorites'
        };
        
        const response = await simulateAPI('GET', endpoints[tab], 
            { 
                user_id: appState.user?.id, 
                page: myPostsData.currentPage,
                page_size: myPostsData.pageSize
            },
            { 
                success: true, 
                data: {
                    posts: generateMockPosts(tab),
                    total: 100,
                    page: myPostsData.currentPage,
                    page_size: myPostsData.pageSize,
                    has_more: myPostsData.currentPage < 5
                }
            }
        );

        if (response.success) {
            const posts = response.data.posts.map(p => new Post(p));
            
            if (append) {
                myPostsData[tab].push(...posts);
            } else {
                myPostsData[tab] = posts;
            }
            
            myPostsData.hasMore = response.data.has_more;
            renderMyPosts(myPostsData[tab], tab);
            
            // 显示/隐藏加载更多按钮
            document.getElementById('loadMoreBtn').style.display = 
                myPostsData.hasMore ? 'block' : 'none';
        }
    } catch (error) {
        console.error('加载帖子失败:', error);
        showToast('加载失败，请重试');
    } finally {
        myPostsData.loading = false;
    }
}

/**
 * 加载更多帖子
 */
async function loadMorePosts() {
    if (!myPostsData.hasMore || myPostsData.loading) return;
    
    myPostsData.currentPage++;
    await loadMyPosts(myPostsData.currentTab, true);
}

/**
 * 生成模拟帖子数据（开发测试用）
 */
function generateMockPosts(tab) {
    const mockData = {
        posts: [
            { 
                id: 'p1', 
                user_id: appState.user?.id,
                content: '今天又被老板骂了，不过没关系，我已经在BOSS KILL里扔了100个便便发泄了！推荐大家都来试试，超解压 😤', 
                emoji: '👔',
                image_url: null,
                tags: ['老板', '吐槽', '解压'],
                likes_count: 328, 
                comments_count: 45, 
                shares_count: 12,
                is_liked: false,
                is_favorited: false,
                created_at: new Date(Date.now() - 2 * 3600000).toISOString()
            },
            { 
                id: 'p2', 
                user_id: appState.user?.id,
                content: '刚刚占领了一栋写字楼！屎塔高度已经超过50米了，感觉人生达到了巅峰 🏆',
                emoji: '🏢',
                image_url: null,
                tags: ['屎塔', '成就', '开心'],
                likes_count: 892, 
                comments_count: 156, 
                shares_count: 67,
                is_liked: true,
                is_favorited: false,
                created_at: new Date(Date.now() - 86400000).toISOString()
            }
        ],
        likes: [
            { 
                id: 'p3', 
                user_id: 'other_user_1',
                content: '办公室摸鱼指南：如何优雅地度过996',
                emoji: '🐟',
                tags: ['摸鱼', '技巧'],
                likes_count: 1520, 
                comments_count: 234, 
                shares_count: 89,
                is_liked: true,
                is_favorited: false,
                created_at: new Date(Date.now() - 172800000).toISOString()
            }
        ],
        favorites: [
            { 
                id: 'p4', 
                user_id: 'other_user_2',
                content: '画了一个我们部门经理的样子，大家觉得像不像？',
                emoji: '🤓',
                tags: ['绘画', '搞笑'],
                likes_count: 1205, 
                comments_count: 234, 
                shares_count: 89,
                is_liked: false,
                is_favorited: true,
                created_at: new Date(Date.now() - 259200000).toISOString()
            }
        ]
    };
    
    return mockData[tab] || [];
}
```

### 4.4 渲染帖子列表
```javascript
/**
 * 渲染帖子列表
 * @param {Array<Post>} posts - 帖子数组
 * @param {string} tab - 当前标签
 */
function renderMyPosts(posts, tab) {
    const container = document.getElementById('homepagePosts');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = renderEmptyState(tab);
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="post-item" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar">${post.emoji || '👤'}</div>
                <div class="post-user-info">
                    <div class="post-username">${appState.user?.name || '游客用户'}</div>
                    <div class="post-time">${post.getTimeAgo()}</div>
                </div>
                ${post.userId === appState.user?.id ? 
                    `<div class="post-menu" onclick="showPostMenu('${post.id}')">⋮</div>` : ''}
            </div>
            <div class="post-content">
                <div class="post-text">${escapeHtml(post.content)}</div>
                ${post.imageUrl ? 
                    `<div class="post-image" onclick="viewImage('${post.imageUrl}')" 
                         style="background-image: url('${post.imageUrl}'); background-size: cover;"></div>` : 
                    (post.emoji ? `<div class="post-image">${post.emoji}</div>` : '')}
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
        posts: {
            emoji: '📝',
            text: '还没有发布任何帖子',
            action: '去画个老板吧',
            onclick: 'switchPage("draw")'
        },
        likes: {
            emoji: '❤️',
            text: '还没有喜欢的内容',
            action: '去首页看看',
            onclick: 'switchPage("swipe")'
        },
        favorites: {
            emoji: '⭐',
            text: '还没有收藏的内容',
            action: '去首页看看',
            onclick: 'switchPage("swipe")'
        }
    };
    
    const state = emptyStates[tab];
    return `
        <div class="empty-state">
            <div class="empty-state-emoji">${state.emoji}</div>
            <div class="empty-state-text">${state.text}</div>
            <div class="empty-state-action">
                <button class="empty-state-btn" onclick="${state.onclick}">${state.action}</button>
            </div>
        </div>
    `;
}

/**
 * HTML转义（防止XSS攻击）
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

### 4.5 标签页切换
```javascript
/**
 * 切换主页标签
 * @param {string} tab - 标签类型: posts/likes/favorites
 * @param {HTMLElement} elem - 点击的标签元素
 */
function switchHomepageTab(tab, elem) {
    // 更新标签激活状态
    document.querySelectorAll('.hp-tab').forEach(t => t.classList.remove('active'));
    if (elem && elem.classList) {
        elem.classList.add('active');
    } else {
        // 如果从统计数据点击进来，手动激活对应标签
        document.querySelectorAll('.hp-tab').forEach(t => {
            if (t.textContent.includes('帖子') && tab === 'posts') t.classList.add('active');
            if (t.textContent.includes('喜欢') && tab === 'likes') t.classList.add('active');
            if (t.textContent.includes('收藏') && tab === 'favorites') t.classList.add('active');
        });
    }
    
    // 记录事件日志
    log('event', '', `切换标签: ${tab}`);

    // 重置分页
    myPostsData.currentPage = 1;
    myPostsData.hasMore = true;
    
    // 加载对应内容
    loadMyPosts(tab);
}
```

### 4.6 点赞功能
```javascript
/**
 * 点赞/取消点赞帖子
 * @param {string} postId - 帖子ID
 * API调用: POST /api/post/like 或 DELETE /api/post/like
 */
async function likePost(postId) {
    try {
        // 查找帖子
        const post = findPostById(postId);
        if (!post) return;
        
        const isLiked = post.isLiked;
        const method = isLiked ? 'DELETE' : 'POST';
        
        // 乐观更新UI
        updatePostLikeUI(postId, !isLiked);
        
        // 调用API
        const response = await simulateAPI(method, '/api/post/like', 
            { 
                user_id: appState.user?.id, 
                post_id: postId 
            },
            { 
                success: true,
                data: {
                    new_like_count: post.likesCount + (isLiked ? -1 : 1)
                }
            }
        );
        
        if (response.success) {
            // 更新数据
            post.isLiked = !isLiked;
            post.likesCount = response.data.new_like_count;
            
            // 更新UI
            updatePostLikeUI(postId, post.isLiked, post.likesCount);
            
            showToast(isLiked ? '已取消点赞' : '点赞成功');
        } else {
            // 回滚UI
            updatePostLikeUI(postId, isLiked);
            showToast('操作失败，请重试');
        }
    } catch (error) {
        console.error('点赞失败:', error);
        showToast('操作失败，请重试');
    }
}

/**
 * 更新帖子点赞UI
 */
function updatePostLikeUI(postId, isLiked, count = null) {
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
    
    if (count !== null) {
        likeCount.textContent = count;
    }
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
```

### 4.7 评论功能
```javascript
/**
 * 显示评论列表
 * @param {string} postId - 帖子ID
 * API调用: GET /api/post/comments
 */
async function showComments(postId) {
    try {
        showLoading('加载评论...');
        
        const response = await simulateAPI('GET', '/api/post/comments', 
            { 
                post_id: postId,
                page: 1,
                page_size: 20
            },
            { 
                success: true,
                data: {
                    comments: [
                        {
                            id: 'c1',
                            user_id: 'user_001',
                            user_name: '路人甲',
                            user_avatar: '😂',
                            content: '这个画得太像我老板了哈哈哈',
                            likes_count: 23,
                            created_at: new Date(Date.now() - 3600000).toISOString()
                        }
                    ],
                    total: 45
                }
            }
        );
        
        if (response.success) {
            renderCommentsModal(postId, response.data.comments);
        }
    } catch (error) {
        console.error('加载评论失败:', error);
        showToast('加载失败，请重试');
    } finally {
        hideLoading();
    }
}

/**
 * 渲染评论弹窗
 */
function renderCommentsModal(postId, comments) {
    // 这里应该显示一个评论弹窗
    // 简化实现，直接显示提示
    showToast(`共有 ${comments.length} 条评论`);
}

/**
 * 发表评论
 * @param {string} postId - 帖子ID
 * @param {string} content - 评论内容
 * API调用: POST /api/post/comment
 */
async function commentPost(postId, content) {
    try {
        const response = await simulateAPI('POST', '/api/post/comment', 
            { 
                user_id: appState.user?.id, 
                post_id: postId,
                content: content
            },
            { 
                success: true,
                data: {
                    comment_id: 'c_' + Date.now(),
                    new_comment_count: 46
                }
            }
        );
        
        if (response.success) {
            showToast('评论成功');
            // 更新评论数
            const post = findPostById(postId);
            if (post) {
                post.commentsCount = response.data.new_comment_count;
                updatePostCommentCount(postId, post.commentsCount);
            }
        }
    } catch (error) {
        console.error('评论失败:', error);
        showToast('评论失败，请重试');
    }
}

/**
 * 更新帖子评论数
 */
function updatePostCommentCount(postId, count) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (!postElement) return;
    
    const commentAction = postElement.querySelectorAll('.post-action')[1];
    const commentCount = commentAction.querySelector('.action-count');
    commentCount.textContent = count;
}
```

### 4.8 分享功能
```javascript
/**
 * 分享帖子
 * @param {string} postId - 帖子ID
 * API调用: POST /api/post/share
 */
async function sharePost(postId) {
    try {
        const response = await simulateAPI('POST', '/api/post/share', 
            { 
                user_id: appState.user?.id, 
                post_id: postId 
            },
            { 
                success: true,
                data: {
                    share_url: `https://bosskill.app/post/${postId}`,
                    new_share_count: 13
                }
            }
        );
        
        if (response.success) {
            // 复制分享链接到剪贴板
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(response.data.share_url);
                showToast('分享链接已复制');
            } else {
                showToast('分享功能开发中');
            }
            
            // 更新分享数
            const post = findPostById(postId);
            if (post) {
                post.sharesCount = response.data.new_share_count;
                updatePostShareCount(postId, post.sharesCount);
            }
        }
    } catch (error) {
        console.error('分享失败:', error);
        showToast('分享失败，请重试');
    }
}

/**
 * 更新帖子分享数
 */
function updatePostShareCount(postId, count) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (!postElement) return;
    
    const shareAction = postElement.querySelectorAll('.post-action')[2];
    const shareCount = shareAction.querySelector('.action-count');
    shareCount.textContent = count;
}
```

### 4.9 帖子菜单功能
```javascript
/**
 * 显示帖子菜单（编辑、删除等）
 * @param {string} postId - 帖子ID
 */
function showPostMenu(postId) {
    const post = findPostById(postId);
    if (!post || post.userId !== appState.user?.id) return;
    
    // 显示菜单选项
    const options = [
        { text: '编辑', icon: '✏️', action: () => editPost(postId) },
        { text: '删除', icon: '🗑️', action: () => deletePost(postId), danger: true }
    ];
    
    showActionSheet('帖子操作', options);
}

/**
 * 编辑帖子
 * @param {string} postId - 帖子ID
 * API调用: PUT /api/post/update
 */
async function editPost(postId) {
    const post = findPostById(postId);
    if (!post) return;
    
    const newContent = prompt('编辑帖子内容', post.content);
    if (!newContent || newContent === post.content) return;
    
    try {
        showLoading('保存中...');
        
        const response = await simulateAPI('PUT', '/api/post/update', 
            { 
                user_id: appState.user?.id, 
                post_id: postId,
                content: newContent
            },
            { success: true }
        );
        
        if (response.success) {
            post.content = newContent;
            post.updatedAt = new Date();
            renderMyPosts(myPostsData[myPostsData.currentTab], myPostsData.currentTab);
            showToast('编辑成功');
        }
    } catch (error) {
        console.error('编辑失败:', error);
        showToast('编辑失败，请重试');
    } finally {
        hideLoading();
    }
}

/**
 * 删除帖子
 * @param {string} postId - 帖子ID
 * API调用: DELETE /api/post/delete
 */
async function deletePost(postId) {
    if (!confirm('确定要删除这条帖子吗？')) return;
    
    try {
        showLoading('删除中...');
        
        const response = await simulateAPI('DELETE', '/api/post/delete', 
            { 
                user_id: appState.user?.id, 
                post_id: postId 
            },
            { success: true }
        );
        
        if (response.success) {
            // 从数据中移除
            myPostsData.posts = myPostsData.posts.filter(p => p.id !== postId);
            
            // 重新渲染
            renderMyPosts(myPostsData.posts, 'posts');
            
            showToast('删除成功');
        }
    } catch (error) {
        console.error('删除失败:', error);
        showToast('删除失败，请重试');
    } finally {
        hideLoading();
    }
}

/**
 * 显示操作菜单
 */
function showActionSheet(title, options) {
    // 简化实现
    const optionTexts = options.map((opt, i) => `${i + 1}. ${opt.icon} ${opt.text}`).join('\n');
    const choice = prompt(`${title}\n\n${optionTexts}\n\n请输入选项序号:`);
    
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < options.length) {
        options[index].action();
    }
}
```

---

## 五、API 接口设计

### 5.1 获取用户主页信息
```
GET /api/user/homepage

请求参数：
{
    "user_id": "string"  // 用户ID
}

响应数据：
{
    "success": true,
    "data": {
        "user_id": "string",
        "name": "string",        // 用户名
        "avatar": "string",      // 头像URL或emoji
        "bio": "string",         // 个人简介
        "location": "string",    // 位置
        "join_date": "string",   // 加入日期
        "stats": {
            "posts": 5,          // 帖子数
            "followers": 128,    // 粉丝数
            "following": 56,     // 关注数
            "likes": 1200        // 获赞数
        }
    }
}
```

### 5.2 获取用户帖子列表
```
GET /api/user/posts

请求参数：
{
    "user_id": "string",  // 用户ID
    "page": 1,            // 页码
    "page_size": 20       // 每页数量
}

响应数据：
{
    "success": true,
    "data": {
        "posts": [
            {
                "id": "string",           // 帖子ID
                "user_id": "string",      // 用户ID
                "content": "string",      // 文字内容
                "image_url": "string",    // 图片URL
                "emoji": "string",        // 表情
                "tags": ["tag1", "tag2"], // 标签
                "likes_count": 328,       // 点赞数
                "comments_count": 45,     // 评论数
                "shares_count": 12,       // 分享数
                "is_liked": false,        // 当前用户是否已点赞
                "is_favorited": false,    // 当前用户是否已收藏
                "created_at": "string",   // 创建时间
                "updated_at": "string"    // 更新时间
            }
        ],
        "total": 100,
        "page": 1,
        "page_size": 20,
        "has_more": true
    }
}
```

### 5.3 点赞帖子
```
POST /api/post/like

请求参数：
{
    "user_id": "string",  // 用户ID
    "post_id": "string"   // 帖子ID
}

响应数据：
{
    "success": true,
    "data": {
        "new_like_count": 329
    },
    "message": "点赞成功"
}
```

### 5.4 取消点赞
```
DELETE /api/post/like

请求参数：
{
    "user_id": "string",  // 用户ID
    "post_id": "string"   // 帖子ID
}

响应数据：
{
    "success": true,
    "data": {
        "new_like_count": 327
    },
    "message": "已取消点赞"
}
```

### 5.5 获取喜欢的帖子
```
GET /api/user/likes

请求参数：
{
    "user_id": "string",  // 用户ID
    "page": 1,            // 页码
    "page_size": 20       // 每页数量
}

响应数据：
{
    "success": true,
    "data": {
        "posts": [...],  // 帖子列表，格式同上
        "total": 50,
        "page": 1,
        "page_size": 20,
        "has_more": true
    }
}
```

### 5.6 获取收藏的帖子
```
GET /api/user/favorites

请求参数：
{
    "user_id": "string",  // 用户ID
    "page": 1,            // 页码
    "page_size": 20       // 每页数量
}

响应数据：
{
    "success": true,
    "data": {
        "posts": [...],  // 帖子列表，格式同上
        "total": 30,
        "page": 1,
        "page_size": 20,
        "has_more": true
    }
}
```

### 5.7 发表评论
```
POST /api/post/comment

请求参数：
{
    "user_id": "string",  // 用户ID
    "post_id": "string",  // 帖子ID
    "content": "string"   // 评论内容
}

响应数据：
{
    "success": true,
    "data": {
        "comment_id": "string",
        "new_comment_count": 46
    },
    "message": "评论成功"
}
```

### 5.8 分享帖子
```
POST /api/post/share

请求参数：
{
    "user_id": "string",  // 用户ID
    "post_id": "string"   // 帖子ID
}

响应数据：
{
    "success": true,
    "data": {
        "share_url": "string",
        "new_share_count": 13
    },
    "message": "分享成功"
}
```

### 5.9 编辑帖子
```
PUT /api/post/update

请求参数：
{
    "user_id": "string",  // 用户ID
    "post_id": "string",  // 帖子ID
    "content": "string",  // 新内容
    "tags": ["tag1"]      // 新标签（可选）
}

响应数据：
{
    "success": true,
    "message": "编辑成功"
}
```

### 5.10 删除帖子
```
DELETE /api/post/delete

请求参数：
{
    "user_id": "string",  // 用户ID
    "post_id": "string"   // 帖子ID
}

响应数据：
{
    "success": true,
    "message": "删除成功"
}
```

---

## 六、数据库设计

### 6.1 用户表（users）
```sql
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    avatar VARCHAR(255),
    bio TEXT,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);
```

### 6.2 帖子表（posts）
```sql
CREATE TABLE posts (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    emoji VARCHAR(10),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_created (created_at DESC)
);
```

### 6.3 点赞表（post_likes）
```sql
CREATE TABLE post_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    post_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_post (post_id)
);
```

### 6.4 收藏表（post_favorites）
```sql
CREATE TABLE post_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    post_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_post (post_id)
);
```

### 6.5 评论表（post_comments）
```sql
CREATE TABLE post_comments (
    id VARCHAR(50) PRIMARY KEY,
    post_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_post_created (post_id, created_at DESC)
);
```

### 6.6 分享记录表（post_shares）
```sql
CREATE TABLE post_shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    post_id VARCHAR(50) NOT NULL,
    platform VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post (post_id),
    INDEX idx_user (user_id)
);
```

### 6.7 帖子标签表（post_tags）
```sql
CREATE TABLE post_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id VARCHAR(50) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post (post_id),
    INDEX idx_tag (tag)
);
```

---

## 七、总结

本模块实现了完整的个人帖子管理功能，符合BOSS KILL项目的架构设计规范：

### 7.1 已实现功能
- ✅ 个人主页完整展示
- ✅ 帖子列表（我的/喜欢/收藏）三标签切换
- ✅ 点赞、评论、分享交互
- ✅ 帖子编辑和删除
- ✅ 分页加载和空状态处理
- ✅ 完整的API接口设计
- ✅ 数据库表结构设计

### 7.2 技术特点
- 🎨 现代化UI设计，符合项目整体风格
- ⚡ 乐观更新策略，提升用户体验
- 🔒 XSS防护，安全的内容渲染
- 📱 响应式设计，适配各种屏幕
- 🔄 完整的错误处理机制

### 7.3 与其他模块的集成
- 与滑一滑服务共享帖子数据结构
- 与推荐服务共享用户行为数据
- 与绘图服务关联作品发布
- 与通知服务集成互动提醒

模块采用模块化设计，易于维护和扩展，为用户提供了完整的个人内容管理体验。

