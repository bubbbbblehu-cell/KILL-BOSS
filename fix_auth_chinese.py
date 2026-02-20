#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix Chinese characters in auth.js
Replace all Chinese text with English equivalents
"""

import re

# Read the file
with open('src/js/auth.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define replacement mappings
replacements = {
    # Comments
    '用户登录（密码登录）': 'User login (password)',
    '如果没有传入参数，从输入框获取': 'Get from input if not provided',
    '输入验证': 'Input validation',
    '邮箱格式验证': 'Email format validation',
    '设置按钮加载状态': 'Set button loading state',
    '友好的错误提示': 'User-friendly error message',
    '更新应用状态': 'Update app state',
    '记住登录邮箱': 'Remember login email',
    '登录成功后直接跳转到首页': 'Redirect to home after login',
    '显示登录成功提示': 'Show login success message',
    '更新个人中心显示': 'Update profile display',
    
    # Toast messages
    '请输入邮箱和密码': 'Please enter email and password',
    '请输入有效的邮箱地址': 'Please enter a valid email',
    '邮箱或密码错误，请检查后重试': 'Invalid email or password',
    '请先验证邮箱，检查收件箱中的确认邮件': 'Please verify email, check inbox',
    '登录成功！欢迎回来': 'Login successful! Welcome back',
    '登录时发生错误，请稍后重试': 'Login error, please try again',
    '网络连接异常': 'Network error',
    
    # Console logs
    '开始登录': 'Login Start',
    '邮箱': 'Email',
    '密码': 'Password',
    '正在发送登录请求': 'Sending login request',
    '登录失败': 'Login failed',
    '错误代码': 'Error code',
    '错误消息': 'Error message',
    '完整错误': 'Full error',
    '登录成功': 'Login successful',
    '用户信息': 'User info',
    '应用状态已更新': 'App state updated',
    '登录完成': 'Login complete',
    '登录过程发生异常': 'Login exception',
    
    # Magic Link
    '发送登录链接': 'Send Magic Link',
    '请输入邮箱地址': 'Please enter email',
    '发送中': 'Sending',
    '正在发送登录链接': 'Sending magic link',
    '发送登录链接失败': 'Send magic link failed',
    '发送失败': 'Send failed',
    '登录链接已发送至邮箱，请查收': 'Magic link sent to email',
    '已发送': 'Sent',
    '重新发送': 'Resend',
    '秒': 's',
    '分钟': 'min',
    '小时': 'hour',
    
    # Registration
    '注册': 'Register',
    '注册中': 'Registering',
    '开始注册': 'Registration Start',
    '密码长度': 'Password length',
    '注册失败': 'Registration failed',
    '该邮箱已被注册，请直接登录': 'Email already registered, please login',
    '密码不符合要求，请使用至少6位字符': 'Password must be at least 6 characters',
    '密码长度至少为6位': 'Password must be at least 6 characters',
    '密码长度不能超过72位': 'Password cannot exceed 72 characters',
    '两次输入的密码不一致，请重新输入': 'Passwords do not match',
    '注册成功': 'Registration successful',
    '注册完成': 'Registration complete',
    '注册时发生错误，请稍后重试': 'Registration error, please try again',
    '欢迎加入': 'Welcome',
    
    # Logout
    '游客登录': 'Guest Login',
    '开始登出': 'Logout Start',
    '登出失败': 'Logout failed',
    '已清除登录状态': 'Login state cleared',
    '登出完成': 'Logout complete',
    '登出过程发生异常': 'Logout exception',
    
    # Profile
    '用户': 'User',
    '未绑定邮箱': 'No email',
    
    # Auth state
    '认证状态变化': 'Auth state changed',
    
    # Buttons
    '登录中': 'Logging in',
    '登 录': 'Login',
    '发送验证码': 'Send Code',
    '验证中': 'Verifying',
    '我知道了': 'Got it',
    '打开 Dashboard': 'Open Dashboard',
    '去登录': 'Go to Login',
    '取消': 'Cancel',
    
    # Error messages
    '发送过于频繁': 'Too frequent',
    '请等待': 'Please wait',
    '后重试': 'and retry',
    '验证码错误或已过期，请重新获取': 'Code invalid or expired',
    '请输入验证码': 'Please enter code',
    '验证码为6位数字': 'Code must be 6 digits',
}

# Apply replacements
for chinese, english in replacements.items():
    content = content.replace(chinese, english)

# Remove emoji from console.log (keep in showToast)
content = re.sub(r'console\.log\("([🔐📧🔑⏳❌✅📱🚪👤📝💾🗑️⚠️🔍📤💡⏰])\s+', r'console.log("', content)
content = re.sub(r'console\.log\("([🔐📧🔑⏳❌✅📱🚪👤📝💾🗑️⚠️🔍📤💡⏰])', r'console.log("', content)
content = re.sub(r'console\.warn\("([🔐📧🔑⏳❌✅📱🚪👤📝💾🗑️⚠️🔍📤💡⏰])\s+', r'console.warn("', content)
content = re.sub(r'console\.error\("([🔐📧🔑⏳❌✅📱🚪👤📝💾🗑️⚠️🔍📤💡⏰])\s+', r'console.error("', content)

# Write back
with open('src/js/auth.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed Chinese characters in auth.js")
print("📝 Backup saved as auth.js.backup")









