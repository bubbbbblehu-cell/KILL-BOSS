# 删除所有表指南

## ⚠️ 重要警告

**删除操作不可逆！** 执行删除脚本后，所有数据将永久丢失，无法恢复。

## 📋 删除前准备

### 1. 备份数据（如果需要）

如果表中有重要数据，请先备份：

```sql
-- 导出数据（在 Supabase Dashboard 中）
-- 1. 进入 Table Editor
-- 2. 选择表
-- 3. 点击 "Export" 导出为 CSV
```

### 2. 确认要删除的表

执行以下查询查看所有表：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

## 🗑️ 删除方法

### 方法一：使用删除脚本（推荐）

1. **打开 Supabase SQL Editor**
   - 登录 Supabase Dashboard
   - 进入你的项目
   - 点击左侧菜单的 "SQL Editor"

2. **复制删除脚本**
   - 打开项目中的 `drop_all_tables.sql` 文件
   - 复制全部内容

3. **执行脚本**
   - 粘贴到 SQL Editor
   - 点击 "Run" 执行
   - 确认删除操作

### 方法二：手动删除（逐个删除）

如果只想删除部分表，可以手动执行：

```sql
-- 删除单个表（会自动删除依赖的触发器、策略等）
DROP TABLE IF EXISTS table_name CASCADE;

-- 例如：
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS map_poops CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
```

### 方法三：删除所有表（快速）

```sql
-- 删除所有 public schema 中的表
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
```

## 📊 删除顺序说明

删除脚本按照以下顺序删除表，避免外键约束错误：

1. **notifications** - 依赖 posts 和 users
2. **favorites** - 依赖 posts 和 users
3. **likes** - 依赖 posts 和 users
4. **comments** - 依赖 posts 和 users
5. **map_poops** - 依赖 users
6. **buildings** - 依赖 users（可为 NULL）
7. **posts** - 依赖 users

## ✅ 删除后验证

执行删除脚本后，运行以下查询验证：

```sql
-- 检查是否还有表存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 应该返回空结果（或只有系统表）
```

## 🔄 重新创建表

删除表后，如果需要重新创建：

1. 执行 `database_setup.sql` 脚本
2. 参考 `SQL_SETUP_GUIDE.md` 获取详细说明

## 🆘 常见问题

### 问题 1：外键约束错误

**错误**：`cannot drop table because other objects depend on it`

**解决**：
- 使用 `CASCADE` 选项：`DROP TABLE table_name CASCADE;`
- 或先删除依赖的表

### 问题 2：权限错误

**错误**：`permission denied`

**解决**：
- 确保使用项目所有者账号
- 检查数据库权限设置

### 问题 3：表不存在错误

**错误**：`relation "table_name" does not exist`

**解决**：
- 使用 `DROP TABLE IF EXISTS` 可以安全忽略不存在的表
- 检查表名是否正确

## 📝 注意事项

1. **CASCADE 选项**：使用 `CASCADE` 会自动删除依赖的对象（索引、约束、触发器、视图等）

2. **auth.users 表**：不要删除 `auth.users` 表，这是 Supabase Auth 管理的系统表

3. **Storage Buckets**：删除表不会删除 Storage 中的文件，需要手动清理

4. **备份重要**：删除前务必备份重要数据

5. **测试环境**：建议先在测试环境执行，确认无误后再在生产环境执行
