# 邮箱验证码登录配置指南

## 问题说明

当前邮箱验证码发送失败的原因是 Supabase 配置不正确。

## 解决步骤

### 1. 获取正确的 Supabase API Key

1. 访问 Supabase Dashboard: https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf
2. 点击左侧菜单 **Settings** → **API**
3. 找到 **Project API keys** 部分
4. 复制 **anon** / **public** key（以 `eyJ` 开头的长字符串）

### 2. 更新配置文件

打开 `src/js/config.js`，将 `SUPABASE_CONFIG.key` 替换为你复制的 anon key：

```javascript
export const SUPABASE_CONFIG = {
    url: 'https://rjqdxxwurocqsewvtduf.supabase.co',
    key: '你的_anon_key_这里', // 替换为实际的 key
    version: '2.39.0'
};
```

### 3. 配置邮箱发送服务

#### 方式一：使用 Supabase 内置邮件服务（推荐用于开发）

Supabase 默认使用内置的邮件服务，但有以下限制：
- 每小时每个邮箱最多发送 3-4 封邮件
- 邮件可能被标记为垃圾邮件

#### 方式二：配置自定义 SMTP（推荐用于生产）

1. 访问 Supabase Dashboard → **Settings** → **Auth**
2. 滚动到 **SMTP Settings** 部分
3. 填写你的 SMTP 配置：
   - **SMTP Host**: 如 `smtp.gmail.com`
   - **SMTP Port**: 通常是 `587` 或 `465`
   - **SMTP User**: 你的邮箱地址
   - **SMTP Password**: 邮箱密码或应用专用密码
   - **Sender Email**: 发件人邮箱
   - **Sender Name**: 发件人名称

#### 常用邮箱 SMTP 配置

**Gmail:**
- Host: `smtp.gmail.com`
- Port: `587`
- 需要开启"两步验证"并生成"应用专用密码"

**Outlook/Hotmail:**
- Host: `smtp-mail.outlook.com`
- Port: `587`

**QQ邮箱:**
- Host: `smtp.qq.com`
- Port: `587`
- 需要开启 SMTP 服务并获取授权码

**163邮箱:**
- Host: `smtp.163.com`
- Port: `465`

### 4. 配置邮件模板（可选）

1. 访问 Supabase Dashboard → **Authentication** → **Email Templates**
2. 自定义 **Magic Link** 模板（用于验证码登录）

### 5. 测试验证码发送

1. 打开应用登录页面
2. 输入邮箱地址
3. 点击"发送验证码"
4. 检查邮箱（包括垃圾邮件文件夹）
5. 输入收到的 6 位验证码
6. 点击"登录"

## 常见问题

### Q1: 提示 "Supabase 对象未定义"

**原因**: Supabase 脚本未正确加载

**解决方案**:
1. 检查网络连接
2. 确保可以访问 `cdn.jsdelivr.net`
3. 检查浏览器控制台是否有脚本加载错误

### Q2: 提示 "发送验证码过于频繁"

**原因**: Supabase 默认限制每小时每个邮箱最多发送 3-4 封邮件

**解决方案**:
1. 等待 1 小时后重试
2. 使用不同的邮箱地址
3. 配置自定义 SMTP 服务（可提高限制）
4. 在 Supabase Dashboard 直接创建用户（推荐）

### Q3: 收不到验证码邮件

**原因**: 
- 邮件被标记为垃圾邮件
- SMTP 配置错误
- 邮箱地址错误

**解决方案**:
1. 检查垃圾邮件文件夹
2. 验证 SMTP 配置是否正确
3. 检查 Supabase Dashboard → **Logs** 查看错误信息
4. 尝试使用其他邮箱（如 Gmail）

### Q4: 验证码输入后提示错误

**原因**:
- 验证码已过期（通常 60 秒有效）
- 验证码输入错误
- 网络问题

**解决方案**:
1. 重新发送验证码
2. 确保在 60 秒内输入
3. 检查验证码是否正确（6 位数字）

## 开发环境快速测试

如果只是想快速测试功能，可以：

1. 在 Supabase Dashboard → **Authentication** → **Users** 
2. 点击 **Add User** 手动创建测试账号
3. 填写邮箱和密码
4. 创建后可以直接使用邮箱验证码登录

## 注意事项

1. **生产环境必须配置自定义 SMTP**，否则邮件可能无法送达
2. **验证码有效期为 60 秒**，过期需要重新发送
3. **每个验证码只能使用一次**
4. **建议添加邮箱域名白名单**，防止滥用

## 相关文档

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Supabase SMTP 配置](https://supabase.com/docs/guides/auth/auth-smtp)
- [邮箱验证码登录](https://supabase.com/docs/guides/auth/auth-magic-link)











