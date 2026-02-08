# 测试数据生成指南

## 📋 使用说明

### 方法一：使用自动脚本（推荐）

1. **确保已有测试用户**
   - 打开 Supabase Dashboard → Authentication → Users
   - 创建至少1个测试用户（建议创建3个）
   - 如果没有用户，先注册几个测试账号

2. **执行 SQL 脚本**
   - 打开 Supabase SQL Editor
   - 复制 `insert_test_data.sql` 文件内容
   - 粘贴并执行
   - 脚本会自动获取用户ID并插入数据

3. **验证数据**
   - 脚本执行完成后，会显示插入的数据统计
   - 可以在 Table Editor 中查看数据

### 方法二：手动创建用户和数据

如果自动脚本不工作，可以手动操作：

1. **创建测试用户**
   - 在应用中注册3个测试账号：
     - test1@bosskill.com / 123456
     - test2@bosskill.com / 123456
     - test3@bosskill.com / 123456

2. **获取用户ID**
   ```sql
   SELECT id, email FROM auth.users LIMIT 5;
   ```

3. **手动插入数据**
   - 复制用户ID
   - 修改 `insert_test_data.sql` 中的 UUID
   - 执行脚本

## 📊 生成的数据内容

### 帖子数据（30条）
- 有趣的打工人吐槽内容
- 包含表情符号
- 时间分布在最近14天内
- 自动分配点赞数和评论数

### 点赞数据
- 为前10个热门帖子添加点赞
- 随机分配用户

### 评论数据（50条）
- 有趣的评论内容
- 分布在15个帖子上
- 包含10种不同的评论模板

### 收藏数据
- 为8个帖子添加收藏
- 随机分配用户

### 地图便便数据（15个）
- 分布在地图的不同位置（0-99）
- 时间分布在最近5天

### 建筑数据（5个）
- 不同类型的建筑
- 分布在地图上

## 🎯 数据特点

- **有趣的内容**：打工人日常吐槽，真实有趣
- **丰富的互动**：包含点赞、评论、收藏
- **时间分布**：数据分布在最近14天内，便于测试榜单功能
- **随机性**：点赞数和评论数随机分布，模拟真实场景

## 🔍 验证数据

执行脚本后，运行以下查询验证：

```sql
-- 查看帖子统计
SELECT 
    COUNT(*) as total_posts,
    SUM(likes_count) as total_likes,
    SUM(comments_count) as total_comments
FROM posts;

-- 查看热门帖子（Top 5）
SELECT 
    text_content,
    likes_count,
    comments_count,
    created_at
FROM posts
ORDER BY likes_count DESC
LIMIT 5;

-- 查看最新帖子
SELECT 
    text_content,
    likes_count,
    comments_count,
    created_at
FROM posts
ORDER BY created_at DESC
LIMIT 5;
```

## 🧹 清理测试数据

如果需要清理测试数据：

```sql
-- 删除所有测试数据（保留表结构）
DELETE FROM favorites;
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM map_poops;
DELETE FROM buildings;
DELETE FROM posts;
```

或者使用 `drop_all_tables.sql` 删除所有表。

## 💡 提示

1. **用户账号**：建议创建3个不同的测试账号，这样可以测试用户间的互动
2. **数据量**：脚本会生成30个帖子，50条评论，足够测试使用
3. **时间分布**：数据时间分布在最近14天，可以测试今日/周/月榜功能
4. **点赞数**：热门帖子会有更多点赞，模拟真实场景

## 🎨 自定义数据

如果想自定义数据内容，可以修改 `insert_test_data.sql` 中的：
- `text_content`：帖子内容
- `content`：评论内容
- `name`：建筑名称
- `position`：地图位置（0-99）
