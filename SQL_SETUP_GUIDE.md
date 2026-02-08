# SQL 数据库设置指南

## ⚠️ 重要提示

**不要直接复制 Markdown 文件（`DATABASE_SCHEMA.md`）的内容到 SQL 编辑器！**

Markdown 文件包含注释和格式，会导致 SQL 语法错误。

## ✅ 正确的使用方法

### 方法一：使用纯 SQL 文件（推荐）

1. **打开 Supabase SQL Editor**
   - 登录 Supabase Dashboard
   - 进入你的项目
   - 点击左侧菜单的 "SQL Editor"

2. **复制 SQL 文件内容**
   - 打开项目中的 `database_setup.sql` 文件
   - 复制**全部内容**
   - 粘贴到 SQL Editor 中

3. **执行 SQL**
   - 点击 "Run" 按钮
   - 等待执行完成
   - 检查是否有错误

### 方法二：分步执行

如果一次性执行所有 SQL 遇到问题，可以分步执行：

#### 步骤 1：创建基础表
```sql
-- 先创建 posts 表（没有外键依赖）
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text_content TEXT,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 步骤 2：创建依赖表
```sql
-- 然后创建依赖 posts 的表
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 步骤 3：创建其他表
继续创建 likes, favorites, notifications, map_poops, buildings 表

#### 步骤 4：创建索引和策略
最后创建索引、RLS 策略和触发器

## 🔍 常见错误及解决方案

### 错误 1：语法错误 `syntax error at or near "#"`
**原因**：复制了 Markdown 文件中的注释（`# 标题`）

**解决**：
- 使用 `database_setup.sql` 文件，不要使用 `DATABASE_SCHEMA.md`
- 确保 SQL 语句以 `CREATE TABLE` 或 `--` 开头

### 错误 2：表已存在 `relation "posts" already exists`
**原因**：表已经创建过了

**解决**：
- SQL 脚本中使用了 `CREATE TABLE IF NOT EXISTS`，可以安全重复执行
- 或者先删除表：`DROP TABLE IF EXISTS posts CASCADE;`

### 错误 3：外键约束错误
**原因**：创建表的顺序不对

**解决**：
- 按照 `database_setup.sql` 中的顺序执行
- posts 表必须在 comments、likes、favorites 之前创建

### 错误 4：权限错误
**原因**：RLS 策略配置问题

**解决**：
- 确保已启用 RLS：`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- 检查策略是否正确创建

## 📋 执行后检查清单

执行完 SQL 脚本后，检查以下内容：

- [ ] 所有表都已创建（posts, comments, likes, favorites, notifications, map_poops, buildings）
- [ ] 所有索引都已创建
- [ ] RLS 已启用
- [ ] RLS 策略已创建
- [ ] 触发器已创建（update_post_likes_count, update_post_comments_count）

## 🧪 测试查询

执行以下查询测试表是否创建成功：

```sql
-- 检查所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 检查 posts 表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts';

-- 检查 RLS 是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 📝 注意事项

1. **Storage Bucket**：还需要在 Supabase Dashboard 中手动创建 Storage Bucket
   - 名称：`post-images`
   - 设置为 Public
   - 文件大小限制：5MB

2. **用户表**：`auth.users` 表由 Supabase Auth 自动管理，无需手动创建

3. **备份**：执行 SQL 前建议备份数据库（如果有重要数据）

4. **测试环境**：建议先在测试环境执行，确认无误后再在生产环境执行

## 🆘 需要帮助？

如果遇到问题：
1. 检查错误信息的具体内容
2. 确认 SQL 语法是否正确
3. 检查表之间的依赖关系
4. 查看 Supabase 日志获取详细错误信息
