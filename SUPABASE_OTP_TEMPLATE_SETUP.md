# 🔧 Supabase 验证码邮件模板配置指南

## ⚠️ 重要提示

要使用验证码登录，必须在 Supabase Dashboard 中配置邮件模板，让邮件显示 6 位数字验证码而不是登录链接。

---

## 📋 配置步骤

### 步骤 1：登录 Supabase Dashboard

访问你的项目邮件模板设置页面：

```
https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/auth/templates
```

### 步骤 2：找到 "Magic Link" 模板

在左侧菜单中找到并点击 **"Magic Link"** 模板

### 步骤 3：修改邮件模板

#### 原始模板（显示链接）：

```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .ConfirmationURL }}">Log In</a></p>
```

#### 修改为（显示验证码）：

```html
<h2>登录验证码</h2>

<p>您好，</p>

<p>您的登录验证码是：</p>

<div style="background: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
    <h1 style="font-size: 36px; letter-spacing: 8px; color: #0369a1; margin: 0; font-family: 'Courier New', monospace;">
        {{ .Token }}
    </h1>
</div>

<p style="color: #666;">
    <strong>验证码有效期为 1 小时</strong>，请勿泄露给他人。
</p>

<p style="color: #999; font-size: 12px;">
    如果您没有请求此验证码，请忽略此邮件。
</p>

<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

<p style="color: #999; font-size: 12px;">
    此邮件由 BOSS KILL 自动发送，请勿回复。
</p>
```

### 步骤 4：保存模板

点击页面底部的 **"Save"** 按钮保存修改。

---

## 🎨 模板变量说明

Supabase 提供以下变量用于邮件模板：

| 变量 | 说明 | 示例 |
|------|------|------|
| `{{ .Token }}` | 6位数字验证码 | `123456` |
| `{{ .TokenHash }}` | Token 哈希值 | `abc123...` |
| `{{ .ConfirmationURL }}` | 确认链接（Magic Link） | `https://...` |
| `{{ .SiteURL }}` | 网站 URL | `https://yoursite.com` |
| `{{ .Email }}` | 用户邮箱 | `user@example.com` |

**关键点**：使用 `{{ .Token }}` 显示验证码，不要使用 `{{ .ConfirmationURL }}`

---

## 📧 完整的美化模板（推荐）

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💩 BOSS KILL</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">释放压力，扔掉烦恼</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">登录验证码</h2>
            
            <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                您好，
            </p>
            
            <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0;">
                您正在登录 BOSS KILL，请使用以下验证码完成登录：
            </p>
            
            <!-- Verification Code -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 0 0 30px 0; border: 2px dashed #0369a1;">
                <p style="color: #0369a1; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">您的验证码</p>
                <h1 style="font-size: 48px; letter-spacing: 12px; color: #0369a1; margin: 0; font-family: 'Courier New', monospace; font-weight: bold;">
                    {{ .Token }}
                </h1>
            </div>
            
            <!-- Tips -->
            <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                    <strong>⏰ 重要提示：</strong><br>
                    • 验证码有效期为 <strong>1 小时</strong><br>
                    • 验证码只能使用 <strong>一次</strong><br>
                    • 请勿将验证码泄露给他人
                </p>
            </div>
            
            <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0;">
                如果您没有请求此验证码，请忽略此邮件。您的账户仍然是安全的。
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                此邮件由 BOSS KILL 自动发送，请勿回复<br>
                © 2024 BOSS KILL. All rights reserved.
            </p>
        </div>
        
    </div>
</body>
</html>
```

---

## ✅ 验证配置是否成功

### 方法 1：发送测试邮件

1. 在你的应用中输入邮箱
2. 点击"发送验证码"
3. 检查邮箱，确认收到的是 **6位数字** 而不是链接

### 方法 2：在 Dashboard 测试

1. 进入 Supabase Dashboard
2. Authentication → Users
3. 点击某个用户的 "..." 菜单
4. 选择 "Send magic link"
5. 检查邮箱内容

---

## 🔍 常见问题

### Q1: 修改模板后还是收到链接？

**解决方案**：
1. 清除浏览器缓存
2. 等待 1-2 分钟让配置生效
3. 确认保存了模板修改
4. 检查是否修改了正确的模板（Magic Link）

### Q2: 邮件样式显示不正常？

**解决方案**：
1. 使用内联样式（style=""）而不是 CSS 类
2. 避免使用复杂的 CSS 属性
3. 测试不同邮件客户端的兼容性

### Q3: 验证码显示为空？

**解决方案**：
1. 确认使用了 `{{ .Token }}` 变量
2. 检查变量拼写是否正确（区分大小写）
3. 确保模板语法正确

---

## 🎯 测试清单

配置完成后，请测试以下场景：

- [ ] 发送验证码成功
- [ ] 邮件中显示 6 位数字验证码
- [ ] 验证码样式正常显示
- [ ] 输入正确验证码可以登录
- [ ] 输入错误验证码提示错误
- [ ] 验证码过期后无法使用
- [ ] 验证码使用一次后失效

---

## 📞 需要帮助？

如果配置过程中遇到问题：

1. 检查 Supabase Dashboard 的 Logs
2. 查看浏览器控制台的错误信息
3. 参考 [Supabase 官方文档](https://supabase.com/docs/guides/auth/auth-email-templates)

---

**配置完成后，记得测试一下验证码登录功能！** ✅

