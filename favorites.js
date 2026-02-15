# 我的收藏列表和管理模块

## 模块概述
本模块实现了用户收藏内容的展示和管理功能，支持收藏帖子、评论和用户，提供分类浏览和取消收藏等核心功能。

---

## 一、功能特性

### 1.1 核心功能
- ✅ 收藏内容分类展示（帖子/评论/用户）
- ✅ 标签页切换浏览
- ✅ 取消收藏功能
- ✅ 空状态提示
- ✅ 实时数据更新
- ✅ 收藏数量统计

### 1.2 页面入口
- 从"我的"页面点击"我的收藏"菜单项进入
- 从个人主页点击"收藏"标签进入
- 菜单路径：个人中心 → 我的收藏

### 1.3 支持的收藏类型
- **帖子收藏**：收藏喜欢的帖子内容
- **评论收藏**：收藏精彩的评论
- **用户收藏**：关注感兴趣的用户

---

## 二、HTML 结构

### 2.1 页面容器
```html
<!-- 我的收藏页面 -->
<div class="page favorites-page" id="favoritesPage">
    <div class="page-header" style="justify-content: flex-start; gap: 15px;">
        <button class="back-btn" onclick="switchPage('profile')">←</button>
        <span class="page-title">我的收藏</span>
    </div>
    <div class="favorites-tabs">
        <button class="favorites-tab active" data-tab="posts" onclick="switchFavoritesTab('posts')">
            帖子
        </button>
        <button class="favorites-tab" data-tab="comments" onclick="switchFavoritesTab('comments')">
            评论
        </button>
        <button class="favorites-tab" data-tab="users" onclick="switchFavoritesTab('users')">
            用户
        </button>
    </div>
    <div class="favorites-content" id="favoritesContent">
        <!-- 由JS动态生成 -->
    </div>
</div>
```

### 2.2 收藏项卡片结构（动态生成）

#### 2.2.1 帖子收藏卡片
```html
<div class="favorite-item">
    <div class="favorite-item-avatar">🐟</div>
    <div class="favorite-item-content">
        <div class="favorite-item-title">办公室摸鱼指南：如何优雅地度过996</div>
        <div class="favorite-item-meta">摸鱼达人 · 2天前</div>
    </div>
    <div class="favorite-item-actions">
        <button class="unfavorite-btn" onclick="unfavorite('posts', 1)">取消收藏</button>
    </div>
</div>
```

#### 2.2.2 评论收藏卡片
```html
<div class="favorite-item">
    <div class="favorite-item-avatar">😂</div>
    <div class="favorite-item-content">
        <div class="favorite-item-title">"这个画得太像我老板了哈哈哈"</div>
        <div class="favorite-item-meta">来自《办公室摸鱼指南》· 路人甲 · 1天前</div>
    </div>
    <div class="favorite-item-actions">
        <button class="unfavorite-btn" onclick="unfavorite('comments', 1)">取消收藏</button>
    </div>
</div>
```

#### 2.2.3 用户收藏卡片
```html
<div class="favorite-item">
    <div class="favorite-item-avatar" style="border-radius: 50%;">🐟</div>
    <div class="favorite-item-content">
        <div class="favorite-item-title">摸鱼达人</div>
        <div class="favorite-item-meta">专业摸鱼20年 · 1234粉丝</div>
    </div>
    <div class="favorite-item-actions">
        <button class="unfavorite-btn" onclick="unfavorite('users', 1)">取消关注</button>
    </div>
</div>
```

#### 2.2.4 空状态
```html
<div class="empty-state">
    <div class="empty-icon">📭</div>
    <div class="empty-text">暂无收藏内容</div>
</div>
```

---

## 三、CSS 样式

### 3.1 页面容器样式
```css
/* 我的收藏页面 */
.favorites-page {
    background: var(--bg-dark);
}
```

### 3.2 标签页样式
```css
.favorites-tabs {
    display: flex;
    background: var(--bg-card);
    padding: 5px;
    margin: 15px;
    border-radius: 12px;
}

.favorites-tab {
    flex: 1;
    padding: 12px;
    text-align: center;
    font-size: 14px;
    color: var(--text-secondary);
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.favorites-tab.active {
    background: var(--accent-orange);
    color: white;
    font-weight: 600;
}
```

### 3.3 内容区域样式
```css
.favorites-content {
    padding: 0 15px 80px;
}
```

### 3.4 收藏项卡片样式
```css
.favorite-item {
    display: flex;
    gap: 15px;
    padding: 15px;
    background: var(--bg-card);
    border-radius: 12px;
    margin-bottom: 10px;
}

.favorite-item-avatar {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    background: var(--bg-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.favorite-item-content {
    flex: 1;
    min-width: 0;
}

.favorite-item-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.favorite-item-meta {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 5px;
}

.favorite-item-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
}

.unfavorite-btn {
    padding: 6px 12px;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
}
```

### 3.5 空状态样式
```css
.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-muted);
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 15px;
}

.empty-text {
    font-size: 14px;
}
```

---

## 四、JavaScript 功能实现

### 4.1 数据模型
```javascript
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
```

### 4.2 显示收藏页面
```javascript
function showFavorites() {
    switchPage('favorites');
    loadFavoritesContent('posts');
}
```

### 4.3 切换标签页
```javascript
function switchFavoritesTab(tab) {
    currentFavoritesTab = tab;
    
    // 更新标签状态
    document.querySelectorAll('.favorites-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    
    loadFavoritesContent(tab);
}
```

### 4.4 加载收藏内容
```javascript
function loadFavoritesContent(tab) {
    const container = document.getElementById('favoritesContent');
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
```

### 4.5 取消收藏
```javascript
async function unfavorite(type, id) {
    // 调用API
    await simulateAPI('DELETE', `/api/favorites/${type}/${id}`, null, { success: true });
    
    // 从数据中移除
    const index = favoritesData[type].findIndex(item => item.id === id);
    if (index > -1) {
        favoritesData[type].splice(index, 1);
    }
    
    // 重新加载内容
    loadFavoritesContent(currentFavoritesTab);
    
    // 显示提示
    showToast('已取消收藏');
}
```

### 4.6 收藏内容（在其他页面调用）
```javascript
async function favoriteContent(contentId) {
    const btn = event.target.closest('.action-btn');
    const isFavorited = appState.favoritedContents.has(contentId);
    const method = isFavorited ? 'DELETE' : 'POST';
    
    await simulateAPI(method, '/api/swipe/favorite', 
        { user_id: appState.user?.id, content_id: contentId },
        { success: true }
    );

    if (isFavorited) {
        appState.favoritedContents.delete(contentId);
        btn.classList.remove('favorited');
    } else {
        appState.favoritedContents.add(contentId);
        btn.classList.add('favorited');
    }
    
    showToast(isFavorited ? '已取消收藏' : '收藏成功！');
}
```

---

## 五、API 接口设计

### 5.1 获取收藏列表
```
GET /api/favorites/{type}

请求参数：
{
    "user_id": "string",  // 用户ID
    "page": 1,            // 页码
    "limit": 20           // 每页数量
}

路径参数：
- type: posts | comments | users

响应数据：
{
    "success": true,
    "data": [
        {
            "id": 1,
            "title": "string",      // 标题（帖子/评论内容）
            "author": "string",     // 作者
            "time": "string",       // 时间
            "avatar": "string",     // 头像
            // 其他字段根据类型不同而不同
        }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
}
```

### 5.2 添加收藏
```
POST /api/favorites/{type}

请求参数：
{
    "user_id": "string",    // 用户ID
    "target_id": "string"   // 目标ID（帖子ID/评论ID/用户ID）
}

路径参数：
- type: posts | comments | users

响应数据：
{
    "success": true,
    "message": "收藏成功"
}
```

### 5.3 取消收藏
```
DELETE /api/favorites/{type}/{id}

路径参数：
- type: posts | comments | users
- id: 收藏项ID

请求参数：
{
    "user_id": "string"  // 用户ID
}

响应数据：
{
    "success": true,
    "message": "已取消收藏"
}
```

### 5.4 检查是否已收藏
```
GET /api/favorites/check

请求参数：
{
    "user_id": "string",    // 用户ID
    "type": "string",       // 类型
    "target_id": "string"   // 目标ID
}

响应数据：
{
    "success": true,
    "is_favorited": true
}
```

### 5.5 获取收藏统计
```
GET /api/favorites/stats

请求参数：
{
    "user_id": "string"  // 用户ID
}

响应数据：
{
    "success": true,
    "data": {
        "posts": 15,      // 收藏的帖子数
        "comments": 8,    // 收藏的评论数
        "users": 23       // 关注的用户数
    }
}
```

---

## 六、交互流程

### 6.1 进入收藏页面
```
1. 用户在"我的"页面点击"我的收藏"菜单
2. 调用 showFavorites() 函数
3. 切换到收藏页面
4. 默认加载"帖子"标签内容
5. 请求 GET /api/favorites/posts 获取收藏的帖子列表
6. 渲染收藏列表
```

### 6.2 切换收藏类型
```
1. 用户点击标签（帖子/评论/用户）
2. 调用 switchFavoritesTab(tab) 函数
3. 更新标签激活状态
4. 请求对应类型的收藏列表
5. 渲染新的收藏内容
```

### 6.3 取消收藏
```
1. 用户点击"取消收藏"按钮
2. 调用 unfavorite(type, id) 函数
3. 请求 DELETE /api/favorites/{type}/{id}
4. 从本地数据中移除该项
5. 重新渲染列表
6. 显示"已取消收藏"提示
```

### 6.4 添加收藏（在其他页面）
```
1. 用户在内容页面点击收藏按钮
2. 调用 favoriteContent(contentId) 函数
3. 请求 POST /api/favorites/{type}
4. 更新按钮状态（已收藏/未收藏）
5. 显示"收藏成功"提示
```

---

## 七、数据库设计

### 7.1 收藏表（favorites）
```sql
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    target_type ENUM('post', 'comment', 'user') NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (user_id, target_type, target_id),
    INDEX idx_user_type (user_id, target_type),
    INDEX idx_created (created_at)
);
```

### 7.2 收藏统计表（favorite_stats）
```sql
CREATE TABLE favorite_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_type ENUM('post', 'comment', 'user') NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    favorite_count INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_target (target_type, target_id)
);
```

### 7.3 相关查询SQL

#### 获取用户收藏的帖子列表
```sql
SELECT 
    p.id,
    p.title,
    p.content,
    p.image_url,
    u.name as author,
    u.avatar,
    f.created_at as favorite_time
FROM favorites f
JOIN posts p ON f.target_id = p.id
JOIN users u ON p.user_id = u.id
WHERE f.user_id = ? 
  AND f.target_type = 'post'
ORDER BY f.created_at DESC
LIMIT ? OFFSET ?;
```

#### 获取用户收藏的评论列表
```sql
SELECT 
    c.id,
    c.content,
    c.post_id,
    p.title as post_title,
    u.name as author,
    u.avatar,
    f.created_at as favorite_time
FROM favorites f
JOIN comments c ON f.target_id = c.id
JOIN posts p ON c.post_id = p.id
JOIN users u ON c.user_id = u.id
WHERE f.user_id = ? 
  AND f.target_type = 'comment'
ORDER BY f.created_at DESC
LIMIT ? OFFSET ?;
```

#### 获取用户关注的用户列表
```sql
SELECT 
    u.id,
    u.name,
    u.avatar,
    u.bio,
    COUNT(DISTINCT uf.follower_id) as followers,
    f.created_at as follow_time
FROM favorites f
JOIN users u ON f.target_id = u.id
LEFT JOIN user_follows uf ON u.id = uf.following_id
WHERE f.user_id = ? 
  AND f.target_type = 'user'
GROUP BY u.id
ORDER BY f.created_at DESC
LIMIT ? OFFSET ?;
```

#### 检查是否已收藏
```sql
SELECT COUNT(*) as count
FROM favorites
WHERE user_id = ?
  AND target_type = ?
  AND target_id = ?;
```

#### 获取收藏统计
```sql
SELECT 
    target_type,
    COUNT(*) as count
FROM favorites
WHERE user_id = ?
GROUP BY target_type;
```

---

## 八、功能扩展建议

### 8.1 待开发功能
- [ ] 收藏夹分组管理
- [ ] 批量取消收藏
- [ ] 收藏内容搜索
- [ ] 收藏内容排序（时间/热度）
- [ ] 收藏内容导出
- [ ] 收藏提醒（收藏的内容有更新）
- [ ] 收藏分享（分享收藏夹给好友）
- [ ] 收藏同步（多设备同步）

### 8.2 性能优化
- [ ] 虚拟滚动（长列表优化）
- [ ] 分页加载（无限滚动）
- [ ] 数据缓存策略
- [ ] 预加载下一页数据
- [ ] 骨架屏加载效果

### 8.3 用户体验优化
- [ ] 下拉刷新
- [ ] 滑动删除收藏
- [ ] 收藏动画效果
- [ ] 收藏数量徽章
- [ ] 快速收藏（长按快捷操作）
- [ ] 收藏历史记录

---

## 九、注意事项

### 9.1 安全性
- 验证用户身份，防止越权操作
- 限制收藏数量，防止恶意收藏
- 防止重复收藏
- 敏感操作需要二次确认

### 9.2 性能
- 收藏列表采用分页加载
- 使用索引优化数据库查询
- 缓存热门收藏数据
- 避免频繁的DOM操作

### 9.3 兼容性
- 支持iOS和Android主流浏览器
- 适配不同屏幕尺寸
- 处理网络异常情况
- 提供降级方案

### 9.4 数据一致性
- 取消收藏时同步更新统计数据
- 删除内容时级联删除收藏记录
- 定期清理无效收藏数据

---

## 十、测试用例

### 10.1 功能测试
- ✅ 进入收藏页面，显示正确的收藏列表
- ✅ 标签页切换正常
- ✅ 取消收藏功能正常工作
- ✅ 空状态正确显示
- ✅ 返回按钮功能正常
- ✅ 收藏按钮状态正确（已收藏/未收藏）

### 10.2 边界测试
- ✅ 没有收藏内容时显示空状态
- ✅ 网络异常时的错误处理
- ✅ 超长标题的显示处理
- ✅ 大量收藏的性能表现
- ✅ 重复收藏的处理

### 10.3 交互测试
- ✅ 快速点击不会重复请求
- ✅ 页面切换动画流畅
- ✅ 触摸反馈及时
- ✅ 滚动性能良好
- ✅ 取消收藏后列表正确更新

---

## 十一、总结

本模块实现了完整的收藏管理功能，包括：
- 📱 清晰的分类展示界面
- 🔄 灵活的标签页切换
- ⭐ 完整的收藏和取消收藏功能
- 📭 友好的空状态提示
- 🎨 现代化的UI设计
- ⚡ 流畅的用户体验

模块采用模块化设计，易于维护和扩展，为用户提供了便捷的内容收藏和管理体验。

---

## 十二、与其他模块的关联

### 12.1 关联模块
- **滑一滑模块**：提供收藏按钮，可收藏内容
- **我的帖子模块**：个人主页显示收藏标签
- **个人中心模块**：提供收藏入口
- **推荐服务**：根据收藏内容优化推荐算法

### 12.2 数据流转
```
用户浏览内容 → 点击收藏按钮 → 添加到收藏列表
用户进入收藏页面 → 查看收藏内容 → 可取消收藏
收藏数据 → 影响推荐算法 → 提供个性化推荐
```

### 12.3 状态同步
- 收藏状态需要在多个页面保持一致
- 取消收藏后需要更新所有相关页面的状态
- 收藏数量变化需要实时反映在UI上

