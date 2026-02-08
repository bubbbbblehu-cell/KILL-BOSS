# 🔧 注册错误解决方案

## ⚠️ 错误信息

**"For security purposes, you can only request this after 47 seconds"**

这是 Supabase 的安全限制（Rate Limiting），防止频繁注册请求。

## ✅ 解决方案

### 方案一：等待后重试（最简单）

1. **等待提示的时间**
   - 错误提示会显示需要等待的秒数（如 47 秒）
   - 等待时间过后，重新点击"注册新账号"

2. **使用不同的邮箱**
   - 如果急需创建多个账号，可以使用不同的邮箱
   - 例如：`test1@bosskill.com`, `test2@bosskill.com`, `test3@bosskill.com`

### 方案二：在 Supabase Dashboard 中创建（推荐）⭐

这是最快的方法，不受速率限制：

1. **打开 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择项目：`rjqdxxwurocqsewvtduf`

2. **创建用户**
   - 点击左侧菜单 **"Authentication"**
   - 点击 **"Users"** 标签
   - 点击右上角 **"Add User"**
   - 填写信息：
     - **Email**: `test1@bosskill.com`
     - **Password**: `123456`
     - ✅ 勾选 **"Auto Confirm User"**（自动确认，无需邮箱验证）
   - 点击 **"Create User"**

3. **重复创建**
   - 可以连续创建多个用户，不受限制
   - 建议创建 2-3 个测试账号

### 方案三：调整 Supabase 速率限制（开发环境）

如果是在开发环境，可以调整速率限制：

1. **进入 Supabase Dashboard**
   - 选择项目

2. **调整设置**
   - 进入 **Project Settings** → **API**
   - 找到 **Rate Limiting** 设置
   - 调整注册请求的限制（开发环境可以调高）

**注意**：生产环境不建议调整，保持安全限制。

## 🎯 推荐流程

### 快速创建测试用户（推荐）

1. **使用 Supabase Dashboard 创建用户**（最快，不受限制）
   - 创建 2-3 个测试账号
   - 每个账号使用不同邮箱

2. **验证用户创建成功**
   ```sql
   SELECT id, email FROM auth.users;
   ```

3. **执行数据脚本**
   - 执行 `insert_test_data.sql`
   - 数据会自动关联到创建的用户

## 📝 创建用户后

用户创建成功后：

1. **验证用户**
   ```sql
   SELECT COUNT(*) FROM auth.users;
   ```
   应该返回 >= 1

2. **执行数据脚本**
   - 执行 `insert_test_data.sql`
   - 这次应该能成功

3. **测试应用**
   - 使用创建的账号登录
   - 测试各项功能

## 💡 建议的测试账号

创建以下测试账号：

- `test1@bosskill.com` / `123456`
- `test2@bosskill.com` / `123456`
- `test3@bosskill.com` / `123456`

## 🔍 为什么会有这个限制？

Supabase 的速率限制是为了：
- 防止恶意注册
- 防止垃圾账号
- 保护服务稳定性

在开发环境中，使用 Dashboard 创建用户是最方便的方式。

## ✅ 完成

用户创建成功后，就可以：
- ✅ 执行 `insert_test_data.sql` 插入测试数据
- ✅ 在应用中登录测试
- ✅ 测试所有功能
