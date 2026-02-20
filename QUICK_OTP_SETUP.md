# ⚡ 验证码登录快速配置指南

## 🎯 目标

将登录方式从 Magic Link（登录链接）改为 OTP 验证码（6位数字）

---

## ✅ 第一步：前端代码（已完成）

我已经帮你修改了以下文件：

### 1. `index.html`
- ✅ 按钮文字改为"发送验证码"
- ✅ 提示信息改为"输入6位数字验证码"
- ✅ 保留验证码输入框

### 2. `src/js/auth.js`
- ✅ 移除 `emailRedirectTo` 参数（确保发送验证码而不是链接）
- ✅ 优化验证码输入流程
- ✅ 完善错误处理

---

## ⚠️ 第二步：配置 Supabase 邮件模板（必须手动完成）

### 快速操作步骤：

#### 1. 打开 Supabase Dashboard
```
https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/auth/templates
```

#### 2. 选择 "Magic Link" 模板
点击左侧菜单的 **"Magic Link"**

#### 3. 替换邮件内容

**删除原有内容，粘贴以下代码：**

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
```

#### 4. 保存模板
点击页面底部的 **"Save"** 按钮

---

## 🧪 第三步：测试验证码登录

### 测试流程：

1. **打开应用登录页面**
   ```
   输入邮箱地址
   点击"发送验证码"
   ```

2. **检查邮箱**
   ```
   打开邮箱（包括垃圾邮件文件夹）
   查看邮件内容
   应该看到 6 位数字验证码（例如：123456）
   ```

3. **输入验证码**
   ```
   在应用中输入 6 位数字
   点击"登录"按钮
   ```

4. **验证成功**
   ```
   自动跳转到首页
   显示"登录成功"提示
   ```

---

## 🔍 验证是否配置成功

### ✅ 成功标志：
- 邮件中显示 **6 位数字**（如：`123456`）
- 邮件中**没有**"Log In"链接
- 输入验证码后可以成功登录

### ❌ 失败标志：
- 邮件中显示"Log In"链接
- 邮件中没有数字验证码
- 输入验证码后提示错误

---

## 🐛 常见问题排查

### 问题 1：还是收到登录链接而不是验证码

**原因**：Supabase 邮件模板没有修改成功

**解决方案**：
1. 重新检查 Supabase Dashboard 的邮件模板
2. 确认使用了 `{{ .Token }}` 而不是 `{{ .ConfirmationURL }}`
3. 确认点击了"Save"按钮
4. 等待 1-2 分钟让配置生效

### 问题 2：收不到邮件

**原因**：发送频率限制

**解决方案**：
1. 检查垃圾邮件文件夹
2. 等待 1 小时后重试
3. 使用不同的邮箱地址
4. 在 Supabase Dashboard 手动创建用户

### 问题 3：验证码输入后提示错误

**原因**：验证码过期或已使用

**解决方案**：
1. 重新发送验证码
2. 确保在 1 小时内使用
3. 验证码只能使用一次

---

## 📋 完整配置检查清单

- [ ] 前端代码已更新（已完成）
- [ ] Supabase 邮件模板已修改
- [ ] 邮件模板已保存
- [ ] 发送测试邮件
- [ ] 邮件中显示 6 位数字验证码
- [ ] 输入验证码可以成功登录
- [ ] 错误验证码提示正确
- [ ] 过期验证码无法使用

---

## 📚 详细文档

如需更详细的说明，请查看：

- **[SUPABASE_OTP_TEMPLATE_SETUP.md](SUPABASE_OTP_TEMPLATE_SETUP.md)** - 完整的邮件模板配置指南
- **[OTP_CODE_SETUP.md](OTP_CODE_SETUP.md)** - 验证码登录技术文档

---

## 🎉 配置完成后

验证码登录配置完成后，用户体验：

1. 输入邮箱 → 点击"发送验证码"
2. 打开邮箱 → 查看 6 位数字验证码
3. 输入验证码 → 点击"登录"
4. 登录成功 ✅

---

**重要提醒**：必须在 Supabase Dashboard 中修改邮件模板，否则仍然会收到登录链接而不是验证码！

**配置链接**：https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/auth/templates

