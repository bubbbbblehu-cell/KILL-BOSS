# 🔗 Magic Link 登录说明

## 📧 什么是 Magic Link？

Magic Link（魔法链接）是一种无密码登录方式：
- 用户输入邮箱
- 系统发送包含登录链接的邮件
- 用户点击邮件中的链接即可登录
- 无需记住密码，更安全便捷

## 🎯 为什么使用 Magic Link？

### 原因
Supabase 的 `signInWithOtp` API 默认发送的是 **Magic Link（登录链接）**，而不是 6 位数字验证码。

你收到的邮件中包含 "Log In" 链接，点击即可登录，这是 Supabase 推荐的方式。

### 优势
- ✅ 更安全（链接包含加密 token）
- ✅ 更方便（无需输入验证码）
- ✅ 自动创建用户（首次登录即注册）
- ✅ 链接有效期 1 小时

## 🚀 使用方法

### 步骤 1: 发送登录链接
1. 在登录页面输入邮箱
2. 点击"发送登录链接"
3. 等待邮件发送成功提示

### 步骤 2: 检查邮箱
1. 打开邮箱收件箱
2. 查找来自 Supabase Auth 的邮件
3. 邮件标题：**"Your Magic Link"**
4. 如果收件箱没有，检查垃圾邮件文件夹

### 步骤 3: 点击登录链接
1. 打开邮件
2. 点击 **"Log In"** 按钮或链接
3. 自动跳转到应用并完成登录

### 步骤 4: 开始使用
- 登录成功后自动跳转到首页
- 会话保持，下次访问无需重新登录

## 📧 邮件示例

```
主题: Your Magic Link

发件人: Supabase Auth <noreply@mail.app.supabase.io>

内容:
Magic Link

Follow this link to login:
[Log In]  ← 点击这个按钮
```

## ⚠️ 注意事项

### 1. 链接有效期
- Magic Link 有效期为 **1 小时**
- 过期后需要重新发送
- 每个链接只能使用一次

### 2. 发送频率限制
- 每小时每个邮箱最多发送 3-4 封邮件
- 超过限制需要等待 1 小时
- 或使用不同的邮箱地址

### 3. 邮件可能被标记为垃圾邮件
- 检查垃圾邮件文件夹
- 将发件人添加到白名单
- 使用 Gmail 等常见邮箱

### 4. 自动创建用户
- 首次使用邮箱登录会自动创建账号
- 无需单独注册
- 用户信息保存在 Supabase

## 🔧 配置要求

### 必须配置
1. **Supabase API Key**
   - 访问: https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/settings/api
   - 复制 "anon public" key
   - 更新 `src/js/config.js`

### 可选配置
2. **自定义 SMTP**（提升邮件送达率）
   - 访问: https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/settings/auth
   - 配置 SMTP 设置
   - 推荐使用 Gmail、Outlook 等

3. **自定义邮件模板**
   - 访问: https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/auth/templates
   - 编辑 "Magic Link" 模板
   - 自定义邮件内容和样式

## 🐛 常见问题

### Q1: 收不到邮件怎么办？

**解决方案**:
1. 检查垃圾邮件文件夹
2. 等待 2-3 分钟（邮件可能延迟）
3. 确认邮箱地址正确
4. 尝试使用 Gmail 等常见邮箱
5. 配置自定义 SMTP
6. 在 Dashboard 手动创建用户

### Q2: 点击链接后没有登录？

**可能原因**:
- 链接已过期（超过 1 小时）
- 链接已被使用
- 浏览器阻止了跳转

**解决方案**:
1. 重新发送登录链接
2. 确保在 1 小时内点击
3. 检查浏览器是否阻止弹窗
4. 尝试在无痕模式下打开链接

### Q3: 提示"发送过于频繁"？

**原因**: 超过了发送频率限制

**解决方案**:
1. 等待 1 小时后重试
2. 使用不同的邮箱地址
3. 在 [Supabase Dashboard](https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/auth/users) 手动创建用户
4. 配置自定义 SMTP（可提高限制）

### Q4: 想要使用验证码而不是链接？

**说明**: Supabase 默认使用 Magic Link，如果需要 6 位数字验证码，需要：

1. 在 Supabase Dashboard 启用 Email OTP
2. 修改代码使用不同的 API
3. 配置邮件模板

**推荐**: 使用 Magic Link 更安全便捷

## 🎯 快速测试

### 方式 1: 使用 Magic Link（推荐）
```
1. 输入邮箱
2. 点击"发送登录链接"
3. 检查邮箱
4. 点击邮件中的链接
5. 自动登录
```

### 方式 2: 游客模式（无需邮箱）
```
1. 点击"以游客身份进入"
2. 立即体验所有功能
```

### 方式 3: Dashboard 创建用户（开发测试）
```
1. 访问 Supabase Dashboard
2. Authentication → Users → Add User
3. 填写邮箱和密码
4. 创建后可以使用 Magic Link 登录
```

## 📊 Magic Link vs 验证码

| 特性 | Magic Link | 验证码 |
|------|-----------|--------|
| 安全性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 便捷性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 用户体验 | 点击即登录 | 需要输入 |
| 有效期 | 1 小时 | 60 秒 |
| 实现难度 | 简单 | 需要额外配置 |
| Supabase 支持 | 默认方式 | 需要启用 |

## 🔒 安全说明

### Magic Link 安全性
- ✅ 链接包含加密的 token
- ✅ 只能使用一次
- ✅ 有过期时间限制
- ✅ 与特定邮箱绑定
- ✅ 无法被暴力破解

### 最佳实践
1. 使用 HTTPS（生产环境必须）
2. 配置正确的 `emailRedirectTo`
3. 启用 Row Level Security (RLS)
4. 定期检查登录日志
5. 配置自定义 SMTP

## 📚 相关文档

- **[QUICK_CONFIG_GUIDE.md](QUICK_CONFIG_GUIDE.md)** - 快速配置指南
- **[EMAIL_VERIFICATION_SETUP.md](EMAIL_VERIFICATION_SETUP.md)** - 邮件配置
- **[SUPABASE_CHECKLIST.md](SUPABASE_CHECKLIST.md)** - Supabase 检查清单
- **[README.md](README.md)** - 项目说明

## 💡 提示

### 开发环境
- 使用游客模式快速测试
- 在 Dashboard 手动创建测试账号
- 配置本地 SMTP 服务器

### 生产环境
- 必须配置自定义 SMTP
- 自定义邮件模板
- 配置正确的域名和 HTTPS
- 监控邮件发送日志

## 🎉 开始使用

现在你已经了解了 Magic Link 的使用方式，可以：

1. ✅ 配置 Supabase API Key
2. ✅ 发送登录链接到邮箱
3. ✅ 点击邮件中的链接登录
4. ✅ 开始使用应用

**祝你使用愉快！** 🚀

---

**更新时间**: 2026-02-09
**版本**: v1.1.0








