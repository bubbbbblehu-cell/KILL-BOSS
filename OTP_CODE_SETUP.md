# 📧 配置 OTP 验证码登录指南

## 🎯 问题说明

当前项目使用的是 **Magic Link（魔法链接）** 登录方式，邮件中包含的是一个可点击的登录链接，而不是 6 位数字验证码。

如果你需要使用 **6 位数字验证码** 登录，需要进行以下配置。

---

## 🔧 配置步骤

### 1. 登录 Supabase Dashboard

访问：https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/auth/templates

### 2. 修改邮件模板

#### 步骤 2.1：选择 "Magic Link" 模板
- 在左侧菜单找到 **"Magic Link"**
- 点击进入编辑

#### 步骤 2.2：修改邮件内容

将邮件模板中的内容修改为显示验证码：

**原始模板**（包含链接）：
```html
<h2>Magic Link</h2>
<p>Click the link below to sign in:</p>
<p><a href="{{ .ConfirmationURL }}">Log In</a></p>
```

**修改为**（显示验证码）：
```html
<h2>登录验证码</h2>
<p>您的登录验证码是：</p>
<h1 style="font-size: 32px; letter-spacing: 5px; color: #000;">{{ .Token }}</h1>
<p>验证码有效期为 1 小时，请勿泄露给他人。</p>
```

#### 步骤 2.3：保存模板
点击 **"Save"** 保存修改

---

## 💻 代码修改

### 修改 1：更新 `sendVerificationCode()` 函数

在 `src/js/auth.js` 中，确保使用正确的参数：

```javascript
export async function sendVerificationCode() {
    const email = document.getElementById('loginEmail')?.value?.trim();
    
    if (!email) {
        showToast("请输入邮箱地址", 'error');
        return false;
    }
    
    const client = getSupabaseClient();
    if (!client) {
        showToast("网络连接异常", 'error');
        return false;
    }

    try {
        // 发送 OTP 验证码
        const { data, error } = await client.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: true,
                // 不设置 emailRedirectTo，这样会发送验证码而不是链接
            }
        });

        if (error) {
            showToast("发送失败: " + error.message, 'error');
            return false;
        }
        
        showToast("验证码已发送至邮箱，请查收", 'success');
        
        // 显示验证码输入框
        document.getElementById('loginCodeInput').style.display = 'block';
        document.getElementById('sendCodeBtn').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('codeHint').style.display = 'block';
        
        return true;
    } catch (err) {
        showToast("发送验证码时发生错误", 'error');
        return false;
    }
}
```

### 修改 2：验证 OTP 验证码

```javascript
export async function handleLoginWithCode() {
    const email = document.getElementById('loginEmail')?.value?.trim();
    const code = document.getElementById('loginCode')?.value?.trim();
    
    if (!email || !code) {
        showToast("请输入邮箱和验证码", 'error');
        return false;
    }
    
    if (code.length !== 6) {
        showToast("验证码为6位数字", 'error');
        return false;
    }

    const client = getSupabaseClient();
    if (!client) {
        showToast("网络连接异常", 'error');
        return false;
    }

    try {
        // 验证 OTP 验证码
        const { data, error } = await client.auth.verifyOtp({
            email: email,
            token: code,
            type: 'email'
        });

        if (error) {
            showToast("验证码错误或已过期", 'error');
            return false;
        }
        
        // 登录成功
        updateUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.email?.split('@')[0] || '用户'
        });
        
        switchPage('swipe');
        showToast('登录成功！', 'success');
        
        return true;
    } catch (err) {
        showToast("验证时发生错误", 'error');
        return false;
    }
}
```

### 修改 3：更新 HTML

在 `index.html` 中恢复验证码输入框：

```html
<div id="loginMode">
    <div class="form-group">
        <label class="form-label">邮箱</label>
        <input type="email" 
               class="form-input" 
               id="loginEmail" 
               placeholder="请输入邮箱">
    </div>
    
    <!-- 验证码输入框 -->
    <div class="form-group" id="loginCodeInput" style="display: none;">
        <label class="form-label">验证码</label>
        <input type="text" 
               class="form-input" 
               id="loginCode" 
               placeholder="请输入6位验证码" 
               maxlength="6">
    </div>
    
    <button class="btn btn-primary" id="sendCodeBtn" onclick="sendVerificationCode()">发送验证码</button>
    <button class="btn btn-primary" id="loginBtn" style="display: none;" onclick="handleLoginWithCode()">登 录</button>
    
    <div class="login-hint" id="codeHint" style="display: none;">
        📧 验证码已发送！请检查邮箱并输入6位数字验证码。
    </div>
</div>
```

---

## ⚠️ 注意事项

### 1. 邮件发送限制
- Supabase 默认限制：每小时每个邮箱最多发送 **3-4 封邮件**
- 超过限制会返回 429 错误
- 建议配置自定义 SMTP 服务器以提高限额

### 2. 验证码有效期
- 默认有效期：**1 小时**
- 验证码只能使用一次
- 过期后需要重新发送

### 3. 安全建议
- 不要在前端代码中硬编码敏感信息
- 使用 HTTPS 传输验证码
- 限制验证码尝试次数

---

## 🆚 Magic Link vs OTP 验证码对比

| 特性 | Magic Link | OTP 验证码 |
|------|-----------|-----------|
| **用户体验** | 点击链接即可登录 | 需要手动输入验证码 |
| **安全性** | 高（链接一次性） | 高（验证码一次性） |
| **实现难度** | 简单 | 需要配置邮件模板 |
| **适用场景** | 快速登录 | 需要二次验证 |
| **邮件内容** | 包含登录链接 | 包含 6 位数字 |

---

## 🔗 相关文档

- [Supabase Auth OTP 文档](https://supabase.com/docs/guides/auth/auth-email-otp)
- [Supabase 邮件模板配置](https://supabase.com/docs/guides/auth/auth-email-templates)
- [自定义 SMTP 配置](https://supabase.com/docs/guides/auth/auth-smtp)

---

## 💡 推荐方案

**建议使用 Magic Link**，原因：
1. ✅ 用户体验更好（一键登录）
2. ✅ 实现更简单（无需额外配置）
3. ✅ 安全性相同
4. ✅ 符合现代 Web 应用趋势

如果确实需要验证码，请按照上述步骤配置。

