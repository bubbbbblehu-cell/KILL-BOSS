# 👤 创建用户账号指南

## ⚠️ 重要提示

执行 `insert_test_data.sql` 之前，**必须先创建至少一个用户账号**！

## 🚀 方法一：在应用中注册（最简单，推荐）

### 步骤：

1. **打开应用**
   - 访问你的应用地址
   - 或打开 `index.html`

2. **注册账号**
   - 点击"注册新账号"按钮
   - 输入邮箱（如：`test1@bosskill.com`）
   - 输入密码（至少6位，如：`123456`）
   - 点击"注册新账号"

3. **完成注册**
   - 如果提示需要邮箱验证，检查邮箱
   - 或暂时禁用邮箱验证（开发环境）

4. **验证用户创建成功**
   - 注册成功后，用户会自动创建
   - 可以在 Supabase Dashboard → Authentication → Users 中查看

### 建议创建3个测试账号：

- `test1@bosskill.com` / `123456`
- `test2@bosskill.com` / `123456`
- `test3@bosskill.com` / `123456`

## 🔧 方法二：在 Supabase Dashboard 中创建

### 步骤：

1. **打开 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 登录并选择项目

2. **进入 Authentication**
   - 点击左侧菜单的 **"Authentication"**
   - 点击 **"Users"** 标签

3. **创建用户**
   - 点击右上角的 **"Add User"** 或 **"Invite User"**
   - 填写信息：
     - **Email**: `test1@bosskill.com`
     - **Password**: `123456`
     - **Auto Confirm User**: ✅ 勾选（自动确认，无需邮箱验证）
   - 点击 **"Create User"**

4. **重复创建**
   - 创建 2-3 个测试用户
   - 每个用户使用不同的邮箱

## ✅ 验证用户是否创建成功

### 在 Supabase Dashboard 中查看：

1. 进入 **Authentication** → **Users**
2. 应该能看到创建的用户列表
3. 确认至少有一个用户

### 使用 SQL 查询：

在 SQL Editor 中执行：

```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

如果返回结果，说明用户创建成功！

## 🎯 创建用户后

用户创建成功后：

1. **重新执行数据脚本**
   - 打开 `insert_test_data.sql`
   - 在 SQL Editor 中执行
   - 这次应该能成功

2. **验证数据**
   ```sql
   SELECT COUNT(*) FROM posts;
   ```
   应该返回 `30`

## 🔍 常见问题

### Q: 为什么需要用户？

A: 因为帖子、点赞、评论等数据都需要关联到用户（`user_id`），这是数据库的外键约束。

### Q: 可以跳过用户创建吗？

A: 不可以。Supabase 的 `auth.users` 表是系统管理的，不能直接通过 SQL 插入。必须通过应用注册或 Dashboard 创建。

### Q: 创建用户后还是报错？

A: 检查：
1. 用户是否真的创建成功（查询 `auth.users` 表）
2. 是否使用了正确的项目
3. 重新执行 `insert_test_data.sql`

## 📝 快速检查清单

- [ ] 已创建至少1个用户账号
- [ ] 可以在 `auth.users` 表中查询到用户
- [ ] 重新执行 `insert_test_data.sql`
- [ ] 看到 "✅ 测试数据插入完成！" 消息
- [ ] 查询 `SELECT COUNT(*) FROM posts;` 返回 30

## 🎉 完成

用户创建成功后，就可以执行 `insert_test_data.sql` 插入测试数据了！
