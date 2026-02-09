# 🚀 快速配置指南

## ⚠️ 重要提示

当前邮箱验证码功能需要正确配置 Supabase API Key 才能使用。

## 📝 快速配置步骤（3分钟）

### 步骤 1: 获取 API Key

1. 打开浏览器，访问：
   ```
   https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/settings/api
   ```

2. 在页面中找到 **"Project API keys"** 部分

3. 复制 **"anon public"** key（注意：不是 service_role key）
   - 正确的 key 以 `eyJ` 开头
   - 长度通常在 200-300 个字符左右

### 步骤 2: 更新配置文件

1. 打开文件：`src/js/config.js`

2. 找到这一行：
   ```javascript
   key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcWR4eHd1cm9jcXNld3Z0ZHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTU5NzcsImV4cCI6MjA1MjMzMTk3N30.请替换为你的实际key',
   ```

3. 将整个 key 替换为你在步骤 1 中复制的 key

4. 保存文件

### 步骤 3: 刷新页面测试

1. 刷新浏览器页面（F5 或 Ctrl+R）

2. 打开浏览器控制台（F12）

3. 查看是否有 ✅ 标记，表示配置成功

4. 如果看到 ❌ 标记，运行以下命令检查问题：
   ```javascript
   checkSupabaseConfig()
   ```

## 🎯 测试邮箱验证码

配置完成后，测试邮箱验证码功能：

1. 在登录页面输入邮箱地址
2. 点击"发送验证码"
3. 检查邮箱（包括垃圾邮件文件夹）
4. 输入收到的 6 位验证码
5. 点击"登录"

## ⚡ 快速测试（无需配置邮件）

如果你只是想快速测试功能，可以：

### 方法 1: 使用游客模式
- 点击"以游客身份进入"按钮
- 立即体验所有功能（数据不会保存）

### 方法 2: 在 Dashboard 创建测试账号
1. 访问：https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/auth/users
2. 点击 **"Add User"**
3. 填写邮箱和密码
4. 创建后可以直接使用邮箱验证码登录

## 🔧 常见问题

### Q: 提示 "Supabase 对象未定义"
**原因**: API Key 配置错误或网络问题

**解决方案**:
1. 检查 API Key 是否正确复制（以 `eyJ` 开头）
2. 检查网络连接
3. 在控制台运行 `checkSupabaseConfig()` 诊断

### Q: 提示 "发送验证码过于频繁"
**原因**: Supabase 默认限制每小时每个邮箱最多发送 3-4 封邮件

**解决方案**:
1. 等待 1 小时后重试
2. 使用不同的邮箱地址
3. 在 Dashboard 直接创建用户（推荐）

### Q: 收不到验证码邮件
**原因**: 邮件被标记为垃圾邮件或 SMTP 未配置

**解决方案**:
1. 检查垃圾邮件文件夹
2. 使用 Gmail 等常见邮箱
3. 配置自定义 SMTP（详见 EMAIL_VERIFICATION_SETUP.md）

## 📚 详细文档

- 完整配置指南: `EMAIL_VERIFICATION_SETUP.md`
- Supabase 检查清单: `SUPABASE_CHECKLIST.md`
- 登录测试指南: `LOGIN_TEST_GUIDE.md`

## 💡 控制台命令

在浏览器控制台（F12）中可以使用以下命令：

```javascript
// 检查配置
checkSupabaseConfig()

// 测试连接
testSupabaseConnection()

// 显示帮助
showConfigHelp()

// 诊断问题
diagnoseSupabase()
```

## 🎉 配置完成

配置完成后，你就可以：
- ✅ 使用邮箱验证码登录
- ✅ 自动创建新用户
- ✅ 保存用户数据
- ✅ 同步到云端

祝你使用愉快！🎨

