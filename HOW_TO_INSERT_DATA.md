# 📝 如何插入测试数据 - 详细步骤

## 🎯 目标
将测试数据插入到 Supabase 数据库中，让应用有内容可以显示。

## 📋 前置条件

### 1. 确保数据库表已创建
- ✅ 已执行 `database_setup.sql` 创建所有表
- ✅ 如果没有，先执行 `database_setup.sql`

### 2. 确保至少有一个用户账号
- ✅ 在应用中注册至少1个账号
- ✅ 或在 Supabase Dashboard → Authentication → Users 中创建用户

## 🚀 执行步骤（详细）

### 步骤 1：打开 Supabase SQL Editor

1. **登录 Supabase**
   - 访问：https://supabase.com/dashboard
   - 使用你的账号登录

2. **选择项目**
   - 在项目列表中找到你的项目：`rjqdxxwurocqsewvtduf`
   - 点击进入项目

3. **打开 SQL Editor**
   - 点击左侧菜单的 **"SQL Editor"**（SQL 编辑器）
   - 或直接访问：`https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/sql`

### 步骤 2：打开测试数据脚本

1. **在项目中找到文件**
   - 打开项目中的 `insert_test_data.sql` 文件
   - 或者直接复制下面的脚本内容

2. **复制脚本内容**
   - 全选文件内容（Ctrl+A）
   - 复制（Ctrl+C）

### 步骤 3：粘贴并执行

1. **粘贴到 SQL Editor**
   - 在 Supabase SQL Editor 的编辑框中
   - 粘贴脚本内容（Ctrl+V）

2. **检查脚本**
   - 确认脚本内容完整
   - 确认没有错误提示

3. **执行脚本**
   - 点击右上角的 **"Run"** 按钮（或按 Ctrl+Enter）
   - 等待执行完成

### 步骤 4：查看执行结果

执行完成后，你会看到：

1. **成功消息**
   ```
   ✅ 测试数据插入完成！
   用户1 ID: xxxxx-xxxxx-xxxxx
   用户2 ID: xxxxx-xxxxx-xxxxx
   用户3 ID: xxxxx-xxxxx-xxxxx
   ```

2. **数据统计**
   - 帖子数量
   - 点赞数量
   - 评论数量
   - 等等

3. **如果有错误**
   - 查看错误信息
   - 根据错误提示修复

### 步骤 5：验证数据

执行以下查询验证数据是否插入成功：

```sql
-- 查看帖子数量
SELECT COUNT(*) as total_posts FROM posts;

-- 查看前5个帖子
SELECT id, text_content, likes_count, comments_count, created_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 5;
```

## 📸 截图说明

### SQL Editor 位置
```
Supabase Dashboard
├── 左侧菜单
│   ├── Table Editor（表编辑器）
│   ├── SQL Editor ← 点击这里
│   ├── Authentication（认证）
│   └── ...
```

### SQL Editor 界面
```
┌─────────────────────────────────────┐
│  SQL Editor                         │
├─────────────────────────────────────┤
│  [编辑框 - 粘贴 SQL 脚本]          │
│                                     │
│  -- 你的 SQL 脚本内容...           │
│                                     │
├─────────────────────────────────────┤
│  [Run] [Save] [New Query]          │
└─────────────────────────────────────┘
```

## ⚠️ 常见问题

### 问题 1：没有用户账号

**错误信息**：`没有找到用户！`

**解决方法**：
1. 在应用中注册一个账号
2. 或在 Supabase Dashboard → Authentication → Users → Add User
3. 创建用户后重新执行脚本

### 问题 2：表不存在

**错误信息**：`relation "posts" does not exist`

**解决方法**：
1. 先执行 `database_setup.sql` 创建所有表
2. 然后再执行 `insert_test_data.sql`

### 问题 3：权限错误

**错误信息**：`permission denied`

**解决方法**：
- 确保使用项目所有者账号登录
- 检查数据库权限设置

### 问题 4：外键约束错误

**错误信息**：`foreign key constraint`

**解决方法**：
- 确保用户表中有用户
- 检查用户ID是否正确

## 🔍 验证数据是否成功插入

执行以下查询检查：

```sql
-- 1. 检查帖子
SELECT COUNT(*) as posts FROM posts;
-- 应该返回 30

-- 2. 检查点赞
SELECT COUNT(*) as likes FROM likes;
-- 应该返回一些数字

-- 3. 检查评论
SELECT COUNT(*) as comments FROM comments;
-- 应该返回 50

-- 4. 检查收藏
SELECT COUNT(*) as favorites FROM favorites;
-- 应该返回一些数字

-- 5. 检查地图便便
SELECT COUNT(*) as poops FROM map_poops;
-- 应该返回 15

-- 6. 检查建筑
SELECT COUNT(*) as buildings FROM buildings;
-- 应该返回 5
```

## ✅ 执行成功的标志

1. ✅ 看到 "✅ 测试数据插入完成！" 消息
2. ✅ 查询返回正确的数据数量
3. ✅ 在应用中能看到帖子内容
4. ✅ 榜单能显示 Top3 帖子

## 🎉 完成后的操作

数据插入成功后：

1. **刷新应用页面**
   - 应该能看到帖子列表
   - 榜单应该显示 Top3

2. **测试功能**
   - 测试滑动功能
   - 测试榜单切换
   - 测试点赞和评论

3. **查看数据**
   - 在 Supabase Table Editor 中查看数据
   - 确认数据正确

## 📝 快速命令

如果熟悉 SQL，可以直接执行：

```sql
-- 快速检查数据
SELECT 
    (SELECT COUNT(*) FROM posts) as posts,
    (SELECT COUNT(*) FROM likes) as likes,
    (SELECT COUNT(*) FROM comments) as comments,
    (SELECT COUNT(*) FROM favorites) as favorites,
    (SELECT COUNT(*) FROM map_poops) as poops,
    (SELECT COUNT(*) FROM buildings) as buildings;
```

## 🆘 需要帮助？

如果遇到问题：
1. 查看错误信息的具体内容
2. 检查是否已创建表和用户
3. 查看 `TEST_DATA_GUIDE.md` 获取更多帮助
