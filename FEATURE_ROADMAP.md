# 功能开发路线图

## 📋 四大功能模块

### 1. 划一划发帖 (泡鼠模块) - Swipe Feed
**模块标识**: `swipe` / `feed`

#### 功能清单
- ✅ **增加评论功能**
  - 用户可以评论帖子
  - 显示评论列表
  - 评论互动功能

- ✅ **去掉点踩功能**
  - 移除 dislike 功能
  - 只保留点赞功能

- ✅ **Top3热门作品改为今日榜单**
  - 将 "Top3 热门作品" 改为 "今日榜单"
  - 右上角增加周榜、月榜、年榜入口
  - 实现榜单切换功能

- ✅ **中间的帖子可以左右滑动表示喜欢/unlike**
  - 左滑 = 不喜欢/跳过
  - 右滑 = 喜欢/点赞
  - 滑动动画效果

---

### 2. 发帖 (泡鼠模块) - Post Creation
**模块标识**: `post` / `create`

#### 功能清单
- ✅ **入口放在菜单栏中间醒目位置**
  - 在底部导航栏中间添加发帖按钮
  - 突出显示，易于访问

- ✅ **增加文字功能**
  - 支持文字输入
  - 文字与图片/绘画组合
  - 文字样式设置

---

### 3. 地图 (拆鼠模块) - Map
**模块标识**: `map`

#### 功能清单
- ✅ **地图呈现**
  - 显示地图界面
  - 地图交互功能
  - 便便和建筑标记

---

### 4. 我的 (拆鼠模块) - Profile
**模块标识**: `profile` / `my`

#### 功能清单
- ✅ **我的作品改为我的帖子**
  - 修改菜单项名称
  - 更新相关文案

- ✅ **我的收藏-细化**
  - 收藏列表展示
  - 收藏分类
  - 收藏管理功能

- ✅ **消息通知-细化**
  - 通知列表
  - 通知分类（评论、点赞、关注等）
  - 通知已读/未读状态
  - 通知设置

---

## 🏗️ 模块结构规划

### 建议的模块文件结构

```
src/js/
├── modules/
│   ├── swipe/              # 划一划发帖模块
│   │   ├── swipeFeed.js    # 滑动feed功能
│   │   ├── comments.js     # 评论功能
│   │   └── leaderboard.js  # 榜单功能
│   │
│   ├── post/               # 发帖模块
│   │   ├── createPost.js   # 创建帖子
│   │   └── textEditor.js   # 文字编辑
│   │
│   ├── map/                # 地图模块
│   │   ├── mapView.js      # 地图视图
│   │   └── mapMarkers.js   # 地图标记
│   │
│   └── profile/            # 我的模块
│       ├── myPosts.js      # 我的帖子
│       ├── favorites.js    # 我的收藏
│       └── notifications.js # 消息通知
```

---

## 📝 开发优先级建议

### Phase 1: 基础功能完善
1. 地图呈现（地图模块）
2. 我的作品改为我的帖子（我的模块）

### Phase 2: 核心交互功能
1. 帖子左右滑动（划一划模块）
2. 增加评论功能（划一划模块）
3. 去掉点踩功能（划一划模块）

### Phase 3: 榜单和内容
1. 今日榜单改造（划一划模块）
2. 周榜、月榜、年榜入口（划一划模块）

### Phase 4: 发帖增强
1. 发帖入口优化（发帖模块）
2. 增加文字功能（发帖模块）

### Phase 5: 我的模块细化
1. 我的收藏细化（我的模块）
2. 消息通知细化（我的模块）

---

## 🔧 技术实现要点

### 滑动功能
- 使用 Touch Events API
- 或使用第三方库（如 Hammer.js）
- 实现平滑的滑动动画

### 榜单功能
- 需要 Supabase 数据库支持
- 按时间范围查询和排序
- 缓存机制优化性能

### 评论功能
- 实时更新（可选 Supabase Realtime）
- 评论嵌套（如果需要）
- 评论权限控制

### 文字编辑
- 富文本编辑器（可选）
- 或简单的文本输入
- 字数限制

---

## 📊 数据库表设计建议

### posts 表（帖子）
- id, user_id, content, image_url, text_content
- likes_count, comments_count
- created_at, updated_at

### comments 表（评论）
- id, post_id, user_id, content
- parent_id (支持回复)
- created_at

### likes 表（点赞）
- id, post_id, user_id
- created_at

### favorites 表（收藏）
- id, post_id, user_id
- created_at

### notifications 表（通知）
- id, user_id, type, content
- related_post_id, related_user_id
- is_read, created_at

---

## ✅ 下一步行动

1. 创建模块文件结构
2. 实现数据库表结构
3. 按优先级逐步开发功能
4. 测试每个功能模块
