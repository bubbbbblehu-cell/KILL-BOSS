/**
 * 认证模块
 * 处理用户登录、注册、登出等功能
 */

import { getSupabaseClient } from './supabase.js';
import { updateUser, clearUser, setGuestMode, appState } from './state.js';
import { startLoginDemo, showToast } from './utils.js';
import { switchPage } from './navigation.js';

/**
 * 用户登录（密码登录）
 */
export async function handleLogin(email, password) {
    // 如果没有传入参数，从输入框获取
    if (!email) {
        email = document.getElementById('loginEmail')?.value?.trim();
    }
    if (!password) {
        password = document.getElementById('loginPassword')?.value;
    }
    
    // 输入验证
    if (!email || !password) {
        showToast("请输入邮箱和密码", 'error');
        console.warn("⚠️ 登录失败: 邮箱或密码为空");
        return false;
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast("请输入有效的邮箱地址", 'error');
        return false;
    }

    console.log("🔐 ========== 开始登录 ==========");
    console.log("📧 邮箱:", email);
    console.log("🔑 密码:", "*".repeat(password.length));

    const client = getSupabaseClient();
    if (!client) {
        const errorMsg = "网络连接异常，Supabase 未就绪。请检查：1) 是否已引入 Supabase 脚本 2) 科学上网环境 3) 控制台具体报错";
        showToast(errorMsg, 'error', 5000);
        console.error("❌", errorMsg);
        return false;
    }

    // 设置按钮加载状态
    const loginBtn = document.getElementById('loginBtn');
    setLoginButtonLoading(true);

    try {
        console.log("⏳ 正在发送登录请求...");
        const { data, error } = await client.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error("❌ 登录失败");
            console.error("错误代码:", error.status || error.code);
            console.error("错误消息:", error.message);
            console.error("完整错误:", error);
            
            // 友好的错误提示
            let errorMsg = "登录失败: " + error.message;
            if (error.message?.includes('Invalid login credentials')) {
                errorMsg = "邮箱或密码错误，请检查后重试";
            } else if (error.message?.includes('Email not confirmed')) {
                errorMsg = "请先验证邮箱，检查收件箱中的确认邮件";
            }
            
            showToast(errorMsg, 'error');
            console.log("🔐 ========== 登录失败 ==========");
            setLoginButtonLoading(false);
            return false;
        } else {
            console.log("✅ 登录成功！");
            console.log("用户信息:", {
                id: data.user.id,
                email: data.user.email,
                created_at: data.user.created_at
            });
            
            // 更新应用状态
            updateUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '用户'
            });
            
            console.log("📱 应用状态已更新");
            console.log("🔐 ========== 登录完成 ==========");
            
            // 记住登录邮箱
            saveLastLoginEmail(email);
            
            // 登录成功后直接跳转到首页
            switchPage('swipe');
            
            // 显示登录成功提示
            showToast('登录成功！欢迎回来 🎉', 'success');
            
            // 更新个人中心显示
            updateProfileDisplay();
            
            setLoginButtonLoading(false);
            return true;
        }
    } catch (err) {
        console.error("❌ 登录过程发生异常:", err);
        showToast("登录时发生错误，请稍后重试", 'error');
        setLoginButtonLoading(false);
        return false;
    }
}

/**
 * 发送 Magic Link（登录链接）
 */
export async function sendMagicLink() {
    const email = document.getElementById('loginEmail')?.value?.trim();
    
    // 输入验证
    if (!email) {
        showToast("请输入邮箱地址", 'error');
        return false;
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast("请输入有效的邮箱地址", 'error');
        return false;
    }

    console.log("📧 ========== 发送登录链接 ==========");
    console.log("📧 邮箱:", email);

    const client = getSupabaseClient();
    if (!client) {
        const errorMsg = "网络连接异常，Supabase 未就绪。请检查：1) 是否已引入 Supabase 脚本 2) 科学上网环境 3) 控制台具体报错";
        showToast(errorMsg, 'error', 5000);
        console.error("❌", errorMsg);
        return false;
    }

    // 设置按钮加载状态
    const sendBtn = document.getElementById('sendMagicLinkBtn');
    const originalText = sendBtn?.textContent;
    
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = '发送中...';
        sendBtn.style.opacity = '0.7';
    }

    try {
        console.log("⏳ 正在发送登录链接...");
        const { data, error } = await client.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: true, // 如果用户不存在，自动创建
                emailRedirectTo: window.location.origin
            }
        });

        if (error) {
            console.error("❌ 发送登录链接失败");
            console.error("错误代码:", error.status || error.code);
            console.error("错误消息:", error.message);
            console.error("完整错误:", error);
            
            let errorMsg = "发送登录链接失败";
            let showCountdown = false;
            let waitSeconds = 60;
            
            // 处理不同类型的错误
            if (error.status === 429 || error.code === 429 || 
                error.message?.includes('rate limit') || 
                error.message?.includes('too many') ||
                error.message?.includes('email rate limit exceeded')) {
                waitSeconds = 3600; // 1小时
                
                const match = error.message?.match(/(\d+)\s*(seconds?|秒|分钟|minutes?|小时|hours?)/i);
                if (match) {
                    waitSeconds = parseInt(match[1]);
                    if (match[2]?.toLowerCase().includes('minute') || match[2]?.includes('分钟')) {
                        waitSeconds *= 60;
                    } else if (match[2]?.toLowerCase().includes('hour') || match[2]?.includes('小时')) {
                        waitSeconds *= 3600;
                    }
                }
                
                const waitMinutes = Math.ceil(waitSeconds / 60);
                const waitHours = Math.floor(waitSeconds / 3600);
                const waitTimeText = waitHours > 0 
                    ? `${waitHours} 小时` 
                    : `${waitMinutes} 分钟`;
                
                errorMsg = `发送过于频繁，请等待 ${waitTimeText} 后重试`;
                showCountdown = true;
                
                setTimeout(() => {
                    showRateLimitSolution(email, waitTimeText);
                }, 500);
            } else if (error.message?.includes('Invalid email') || error.message?.includes('email')) {
                errorMsg = "邮箱格式不正确，请检查后重试";
            } else {
                errorMsg = "发送失败: " + (error.message || '未知错误');
            }
            
            showToast(errorMsg, 'error', 5000);
            console.log("📧 ========== 发送失败 ==========");
            
            // 恢复按钮状态
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.textContent = originalText || '发送登录链接';
                sendBtn.style.opacity = '1';
            }
            
            if (showCountdown) {
                startErrorCountdown(sendBtn, waitSeconds);
            }
            
            return false;
        } else {
            console.log("✅ 登录链接已发送！");
            console.log("📧 请检查邮箱:", email);
            
            showToast("登录链接已发送至邮箱，请查收", 'success', 5000);
            
            // 显示提示信息
            const hint = document.getElementById('magicLinkHint');
            if (hint) {
                hint.style.display = 'block';
            }
            
            // 记住登录邮箱
            saveLastLoginEmail(email);
            
            // 恢复按钮状态，但保持禁用一段时间
            if (sendBtn) {
                sendBtn.textContent = '已发送';
                startMagicLinkCountdown(sendBtn, 60);
            }
            
            console.log("📧 ========== 发送完成 ==========");
            return true;
        }
    } catch (err) {
        console.error("❌ 发送登录链接过程发生异常:", err);
        showToast("发送登录链接时发生错误，请稍后重试", 'error');
        
        // 恢复按钮状态
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = originalText || '发送登录链接';
            sendBtn.style.opacity = '1';
        }
        return false;
    }
}

/**
 * 开始 Magic Link 发送倒计时
 */
function startMagicLinkCountdown(button, seconds) {
    if (!button) return;
    
    let countdown = seconds;
    button.disabled = true;
    
    const timer = setInterval(() => {
        button.textContent = `重新发送(${countdown}秒)`;
        countdown--;
        
        if (countdown < 0) {
            clearInterval(timer);
            button.disabled = false;
            button.textContent = '重新发送登录链接';
            button.style.opacity = '1';
        }
    }, 1000);
}

/**
 * 发送验证码（已废弃，改用 Magic Link）
 * @deprecated 已改用 Magic Link 登录
 */
export async function sendVerificationCode() {
    const email = document.getElementById('loginEmail')?.value?.trim();
    
    // 输入验证
    if (!email) {
        showToast("请输入邮箱地址", 'error');
        return false;
    }
    
    // 邮箱格式验证（只在点击按钮时验证，不在输入过程中验证）
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast("请输入有效的邮箱地址", 'error');
        return false;
    }

    console.log("📧 ========== 发送验证码 ==========");
    console.log("📧 邮箱:", email);

    const client = getSupabaseClient();
    if (!client) {
        const errorMsg = "网络连接异常，Supabase 未就绪。请检查：1) 是否已引入 Supabase 脚本 2) 科学上网环境 3) 控制台具体报错";
        showToast(errorMsg, 'error', 5000);
        console.error("❌", errorMsg);
        return false;
    }

    // 设置按钮加载状态
    const sendBtn = document.getElementById('sendCodeBtn');
    const originalText = sendBtn?.textContent;
    
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = '发送中...';
        sendBtn.style.opacity = '0.7';
    }

    try {
        console.log("⏳ 正在发送验证码...");
        
        // Supabase 的 signInWithOtp 默认发送 Magic Link（魔法链接）
        // 如果需要 6 位数字验证码，需要在 Supabase Dashboard 中配置
        // 目前使用 Magic Link 方式（用户点击邮件中的链接即可登录）
        const { data, error } = await client.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: true, // 如果用户不存在，自动创建
                emailRedirectTo: window.location.origin
            }
        });

        if (error) {
            console.error("❌ 发送验证码失败");
            console.error("错误代码:", error.status || error.code);
            console.error("错误消息:", error.message);
            console.error("完整错误:", error);
            
            let errorMsg = "发送验证码失败";
            let showCountdown = false;
            let waitSeconds = 60;
            
            // 处理不同类型的错误
            if (error.status === 429 || error.code === 429 || 
                error.message?.includes('rate limit') || 
                error.message?.includes('too many') ||
                error.message?.includes('email rate limit exceeded')) {
                // Supabase 默认限制：每小时每个邮箱最多发送一定数量的邮件
                // 通常需要等待 1 小时，但我们设置一个合理的等待时间
                waitSeconds = 3600; // 1小时 = 3600秒
                
                // 尝试从错误消息中提取等待时间（如果有）
                const match = error.message?.match(/(\d+)\s*(seconds?|秒|分钟|minutes?|小时|hours?)/i);
                if (match) {
                    waitSeconds = parseInt(match[1]);
                    if (match[2]?.toLowerCase().includes('minute') || match[2]?.includes('分钟')) {
                        waitSeconds *= 60;
                    } else if (match[2]?.toLowerCase().includes('hour') || match[2]?.includes('小时')) {
                        waitSeconds *= 3600;
                    }
                }
                
                const waitMinutes = Math.ceil(waitSeconds / 60);
                const waitHours = Math.floor(waitSeconds / 3600);
                const waitTimeText = waitHours > 0 
                    ? `${waitHours} 小时` 
                    : `${waitMinutes} 分钟`;
                
                errorMsg = `发送验证码过于频繁，请等待 ${waitTimeText} 后重试`;
                showCountdown = true;
                
                // 显示详细的解决方案弹窗
                setTimeout(() => {
                    showRateLimitSolution(email, waitTimeText);
                }, 500);
            } else if (error.message?.includes('Invalid email') || error.message?.includes('email')) {
                errorMsg = "邮箱格式不正确，请检查后重试";
            } else {
                errorMsg = "发送失败: " + (error.message || '未知错误');
            }
            
            showToast(errorMsg, 'error', 5000);
            console.log("📧 ========== 发送失败 ==========");
            
            // 恢复按钮状态
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.textContent = originalText || '发送验证码';
                sendBtn.style.opacity = '1';
            }
            
            // 如果是因为频率限制，显示倒计时
            if (showCountdown) {
                startErrorCountdown(sendBtn, waitSeconds);
            }
            
            return false;
        } else {
            console.log("✅ 验证码已发送！");
            console.log("📧 请检查邮箱:", email);
            
            showToast("验证码已发送至邮箱，请查收", 'success');
            
            // 显示验证码输入框
            const codeInput = document.getElementById('loginCodeInput');
            const loginBtn = document.getElementById('loginBtn');
            
            if (codeInput) codeInput.style.display = 'block';
            if (sendBtn) sendBtn.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'block';
            
            // 聚焦到验证码输入框
            setTimeout(() => {
                document.getElementById('loginCode')?.focus();
            }, 300);
            
            // 开始倒计时
            startCodeCountdown();
            
            console.log("📧 ========== 发送完成 ==========");
            return true;
        }
    } catch (err) {
        console.error("❌ 发送验证码过程发生异常:", err);
        showToast("发送验证码时发生错误，请稍后重试", 'error');
        
        // 恢复按钮状态
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = originalText || '发送验证码';
            sendBtn.style.opacity = '1';
        }
        return false;
    }
}

/**
 * 使用验证码登录
 */
export async function handleLoginWithCode() {
    const email = document.getElementById('loginEmail')?.value?.trim();
    const code = document.getElementById('loginCode')?.value?.trim();
    
    // 输入验证
    if (!email) {
        showToast("请输入邮箱地址", 'error');
        return false;
    }
    
    if (!code) {
        showToast("请输入验证码", 'error');
        return false;
    }
    
    if (code.length !== 6) {
        showToast("验证码为6位数字", 'error');
        return false;
    }

    console.log("🔐 ========== 验证码登录 ==========");
    console.log("📧 邮箱:", email);
    console.log("🔢 验证码:", code);

    const client = getSupabaseClient();
    if (!client) {
        const errorMsg = "网络连接异常，Supabase 未就绪";
        showToast(errorMsg, 'error', 5000);
        return false;
    }

    // 设置按钮加载状态
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn?.textContent;
    
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = '验证中...';
        loginBtn.style.opacity = '0.7';
    }

    try {
        console.log("⏳ 正在验证...");
        const { data, error } = await client.auth.verifyOtp({
            email: email,
            token: code,
            type: 'email'
        });

        if (error) {
            console.error("❌ 验证失败");
            console.error("错误代码:", error.status || error.code);
            console.error("错误消息:", error.message);
            console.error("完整错误:", error);
            
            let errorMsg = "验证失败: " + error.message;
            if (error.message?.includes('Invalid') || error.message?.includes('expired')) {
                errorMsg = "验证码错误或已过期，请重新获取";
            }
            
            showToast(errorMsg, 'error');
            console.log("🔐 ========== 验证失败 ==========");
            
            // 恢复按钮状态
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = originalText || '登 录';
                loginBtn.style.opacity = '1';
            }
            return false;
        } else {
            console.log("✅ 登录成功！");
            console.log("用户信息:", {
                id: data.user.id,
                email: data.user.email,
                created_at: data.user.created_at
            });
            
            // 更新应用状态
            updateUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '用户'
            });
            
            console.log("📱 应用状态已更新");
            console.log("🔐 ========== 登录完成 ==========");
            
            // 登录成功后直接跳转到首页
            switchPage('swipe');
            
            // 显示登录成功提示
            showToast('登录成功！欢迎回来 🎉', 'success');
            
            // 更新个人中心显示
            updateProfileDisplay();
            
            // 记住登录邮箱
            saveLastLoginEmail(email);
            
            return true;
        }
    } catch (err) {
        console.error("❌ 验证过程发生异常:", err);
        showToast("验证时发生错误，请稍后重试", 'error');
        
        // 恢复按钮状态
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = originalText || '登 录';
            loginBtn.style.opacity = '1';
        }
        return false;
    }
}

/**
 * 保存上次登录的邮箱
 */
function saveLastLoginEmail(email) {
    try {
        if (email && email.trim()) {
            localStorage.setItem('bossKill_lastLoginEmail', email.trim());
            console.log("💾 已保存登录邮箱:", email);
        }
    } catch (err) {
        console.warn("⚠️ 保存登录邮箱失败:", err);
    }
}

/**
 * 获取上次登录的邮箱
 */
function getLastLoginEmail() {
    try {
        const email = localStorage.getItem('bossKill_lastLoginEmail');
        return email || '';
    } catch (err) {
        console.warn("⚠️ 读取登录邮箱失败:", err);
        return '';
    }
}

/**
 * 清除保存的登录邮箱
 */
function clearLastLoginEmail() {
    try {
        localStorage.removeItem('bossKill_lastLoginEmail');
        console.log("🗑️ 已清除保存的登录邮箱");
    } catch (err) {
        console.warn("⚠️ 清除登录邮箱失败:", err);
    }
}

/**
 * 恢复上次登录的邮箱到输入框
 */
export function restoreLastLoginEmail() {
    const email = getLastLoginEmail();
    if (email) {
        const loginEmailInput = document.getElementById('loginEmail');
        if (loginEmailInput) {
            loginEmailInput.value = email;
            console.log("📧 已恢复上次登录邮箱:", email);
        }
    }
}

/**
 * 开始验证码发送倒计时
 */
function startCodeCountdown() {
    const sendBtn = document.getElementById('sendCodeBtn');
    if (!sendBtn) return;
    
    let countdown = 60;
    sendBtn.disabled = true;
    
    const timer = setInterval(() => {
        sendBtn.textContent = `重新发送(${countdown}秒)`;
        countdown--;
        
        if (countdown < 0) {
            clearInterval(timer);
            sendBtn.disabled = false;
            sendBtn.textContent = '重新发送验证码';
            sendBtn.style.opacity = '1';
        }
    }, 1000);
}

/**
 * 开始错误倒计时（发送失败后的等待时间）
 */
function startErrorCountdown(button, seconds) {
    if (!button) return;
    
    let countdown = seconds;
    button.disabled = true;
    const originalText = button.textContent || '发送验证码';
    
    // 如果等待时间超过5分钟，使用分钟显示
    const useMinutes = countdown > 300;
    
    const timer = setInterval(() => {
        if (useMinutes) {
            const minutes = Math.floor(countdown / 60);
            const secs = countdown % 60;
            button.textContent = `请等待 ${minutes}分${secs}秒后重试`;
        } else {
            button.textContent = `请等待 ${countdown} 秒后重试`;
        }
        countdown--;
        
        if (countdown < 0) {
            clearInterval(timer);
            button.disabled = false;
            button.textContent = originalText;
            button.style.opacity = '1';
        }
    }, 1000);
}

// handleLogin 函数已在上面定义，用于密码登录

/**
 * 用户注册
 */
export async function handleRegister(email, password) {
    // 输入验证
    if (!email || !password) {
        showToast("请输入邮箱和密码", 'error');
        console.warn("⚠️ 注册失败: 邮箱或密码为空");
        return false;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast("请输入有效的邮箱地址", 'error');
        return false;
    }

    if (password.length < 6) {
        showToast("密码长度至少为6位", 'error');
        console.warn("⚠️ 注册失败: 密码长度不足");
        return false;
    }
    
    // 密码强度检查（可选，但建议）
    if (password.length > 72) {
        showToast("密码长度不能超过72位", 'error');
        return false;
    }

    console.log("📝 ========== 开始注册 ==========");
    console.log("📧 邮箱:", email);
    console.log("🔑 密码长度:", password.length);

    const client = getSupabaseClient();
    if (!client) {
        const errorMsg = "网络连接异常，Supabase 未就绪。请检查：1) 是否已引入 Supabase 脚本 2) 科学上网环境 3) 控制台具体报错";
        showToast(errorMsg, 'error', 5000);
        console.error("❌", errorMsg);
        return false;
    }

    // 注意：Supabase 为了安全，不会暴露邮箱是否存在的信息（防止邮箱枚举攻击）
    // 所以我们需要在注册后根据返回结果来判断

    try {
        console.log("⏳ 正在发送注册请求...");
        const { data, error } = await client.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (error) {
            console.error("❌ 注册失败");
            console.error("错误代码:", error.status || error.code);
            console.error("错误消息:", error.message);
            console.error("完整错误:", error);
            
            // 友好的错误提示
            let errorMsg = "注册失败: " + error.message;
            let showLoginButton = false;
            
            // 检查各种可能的"已注册"错误情况
            const errorMessage = error.message?.toLowerCase() || '';
            const errorCode = error.code || error.status;
            
            if (errorMessage.includes('already registered') || 
                errorMessage.includes('already exists') ||
                errorMessage.includes('user already registered') ||
                errorMessage.includes('email address is already registered') ||
                errorCode === 422 ||
                errorCode === 'user_already_registered') {
                errorMsg = "该邮箱已被注册，请直接登录";
                showLoginButton = true;
            } else if (errorMessage.includes('password')) {
                errorMsg = "密码不符合要求，请使用至少6位字符";
            } else if (errorMessage.includes('security purposes') || 
                       errorMessage.includes('after') || 
                       errorMessage.includes('seconds')) {
                // 提取等待时间
                const match = error.message.match(/(\d+)\s*seconds?/i);
                const seconds = match ? match[1] : '60';
                errorMsg = `注册请求过于频繁，请等待 ${seconds} 秒后重试\n\n或者：\n1. 在 Supabase Dashboard → Authentication → Users 中直接创建用户\n2. 等待 ${seconds} 秒后重新注册`;
            }
            
            // 显示错误提示
            showToast(errorMsg, 'error', 5000);
            
            // 如果邮箱已注册，显示切换到登录模式的提示
            if (showLoginButton) {
                setTimeout(() => {
                    const email = document.getElementById('registerEmail')?.value;
                    if (email) {
                        showEmailExistsPrompt(email);
                    }
                }, 500);
            }
            
            console.log("📝 ========== 注册失败 ==========");
            return false;
        } else {
            // 检查返回的数据，判断是否真的注册成功
            // 如果 user 存在但没有 session，可能是邮箱验证模式
            // 如果 user 不存在，可能是邮箱已存在但 Supabase 没有返回错误
            
            console.log("📝 注册响应:", {
                hasUser: !!data.user,
                hasSession: !!data.session,
                userEmail: data.user?.email
            });
            
            // 如果返回了用户但没有 session，需要邮箱验证
            if (data.user && !data.session) {
                // 检查这是新注册还是已存在的用户
                // 如果用户创建时间很近（比如1分钟内），可能是新注册
                const userCreatedAt = new Date(data.user.created_at);
                const now = new Date();
                const diffMinutes = (now - userCreatedAt) / (1000 * 60);
                
                if (diffMinutes < 1) {
                    // 新注册，需要邮箱验证
                    showToast("注册成功！请检查邮箱并点击确认链接以完成注册。", 'info', 5000);
                    console.log("📧 需要邮箱验证，已发送确认邮件");
                    console.log("📝 ========== 注册完成 ==========");
                    return false;
                } else {
                    // 用户已存在，但 Supabase 没有返回错误（可能是安全策略）
                    console.warn("⚠️ 用户可能已存在，但 Supabase 返回了成功响应");
                    showToast("该邮箱可能已注册，请尝试直接登录", 'error', 5000);
                    setTimeout(() => {
                        const email = document.getElementById('registerEmail')?.value;
                        if (email) {
                            showEmailExistsPrompt(email);
                        }
                    }, 500);
                    return false;
                }
            } else if (!data.user) {
                // 没有返回用户，可能是邮箱已存在
                console.warn("⚠️ 注册响应中没有用户信息，邮箱可能已存在");
                showToast("该邮箱可能已注册，请尝试直接登录", 'error', 5000);
                setTimeout(() => {
                    const email = document.getElementById('registerEmail')?.value;
                    if (email) {
                        showEmailExistsPrompt(email);
                    }
                }, 500);
                return false;
            } else {
                // 自动登录成功
                console.log("✅ 注册成功！");
                console.log("用户信息:", {
                    id: data.user.id,
                    email: data.user.email,
                    created_at: data.user.created_at
                });
                
                updateUser({
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.email?.split('@')[0] || '用户'
                });
                console.log("✅ 已自动登录");
                
                // 跳转到首页
                switchPage('swipe');
                showToast('注册成功！欢迎加入 🎉', 'success');
                updateProfileDisplay();
                
                console.log("📝 ========== 注册完成 ==========");
                return true;
            }
        }
    } catch (err) {
        console.error("❌ 注册过程发生异常:", err);
        showToast("注册时发生错误，请稍后重试", 'error');
        return false;
    }
}

/**
 * 游客登录
 */
export function handleGuestLogin() {
    console.log("👤 ========== 游客登录 ==========");
    setGuestMode();
    console.log("✅ 已切换到游客模式");
    startLoginDemo();
}

/**
 * 用户登出
 */
export async function handleLogout() {
    console.log("🚪 ========== 开始登出 ==========");
    
    const client = getSupabaseClient();
    
    // 如果是 Supabase 用户，调用登出 API
    if (client) {
        try {
            const { error } = await client.auth.signOut();
            if (error) {
                console.error("❌ Supabase 登出失败:", error);
            } else {
                console.log("✅ Supabase 登出成功");
            }
        } catch (err) {
            console.error("❌ 登出过程发生异常:", err);
        }
    }
    
    // 清除应用状态
    clearUser();
    
    console.log("✅ 已清除登录状态");
    console.log("🚪 ========== 登出完成 ==========");
    
    // 返回登录页面
    switchPage('login');
    
    // 恢复上次登录的邮箱（不清空，方便下次登录）
    restoreLastLoginEmail();
    
    // 清空验证码输入框（如果有）
    const codeInput = document.getElementById('loginCode');
    if (codeInput) codeInput.value = '';
    
    // 隐藏验证码输入框
    const codeInputContainer = document.getElementById('loginCodeInput');
    const sendBtn = document.getElementById('sendCodeBtn');
    const loginBtn = document.getElementById('loginBtn');
    
    if (codeInputContainer) codeInputContainer.style.display = 'none';
    if (sendBtn) {
        sendBtn.style.display = 'block';
        sendBtn.disabled = false;
        sendBtn.textContent = '发送验证码';
        sendBtn.style.opacity = '1';
    }
    if (loginBtn) loginBtn.style.display = 'none';
}

// showToast 已从 utils.js 导入

/**
 * 设置登录按钮加载状态
 */
function setLoginButtonLoading(isLoading) {
    const loginBtn = document.querySelector('.login-form .btn-primary');
    if (!loginBtn) return;
    
    if (isLoading) {
        loginBtn.disabled = true;
        loginBtn.textContent = '登录中...';
        loginBtn.classList.add('loading');
        loginBtn.style.opacity = '0.7';
    } else {
        loginBtn.disabled = false;
        loginBtn.textContent = '登 录';
        loginBtn.classList.remove('loading');
        loginBtn.style.opacity = '1';
    }
}

/**
 * 更新个人中心显示
 */
function updateProfileDisplay() {
    if (!appState.user) return;
    
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    if (profileName) {
        profileName.textContent = appState.user.name || appState.user.email?.split('@')[0] || '用户';
    }
    
    if (profileEmail) {
        profileEmail.textContent = appState.user.email || '未绑定邮箱';
    }
}

/**
 * 监听认证状态变化
 */
export function setupAuthListener() {
    const client = getSupabaseClient();
    if (!client) return;
    
    // 监听认证状态变化
    client.auth.onAuthStateChange((event, session) => {
        console.log("🔐 认证状态变化:", event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
            // 用户登录
            updateUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '用户'
            });
            updateProfileDisplay();
            
            // 如果当前在登录页，切换到首页
            const loginPage = document.getElementById('loginPage');
            if (loginPage && loginPage.classList.contains('active')) {
                switchPage('swipe');
            }
        } else if (event === 'SIGNED_OUT') {
            // 用户登出
            clearUser();
            switchPage('login');
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            // Token 刷新
            updateUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '用户'
            });
        }
    });
}

// 导出到 window 对象，供 HTML 调用
window.sendMagicLink = sendMagicLink;
window.sendVerificationCode = sendVerificationCode; // 保留兼容性
window.handleLoginWithCode = handleLoginWithCode; // 保留兼容性
window.restoreLastLoginEmail = restoreLastLoginEmail;

window.handleRegister = async function() {
    const email = document.getElementById('registerEmail')?.value?.trim();
    const password = document.getElementById('registerPassword')?.value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm')?.value;
    
    // 验证确认密码
    if (password !== passwordConfirm) {
        showToast("两次输入的密码不一致，请重新输入", 'error');
        return;
    }
    
    // 设置注册按钮加载状态
    const registerBtn = document.getElementById('registerBtn');
    const originalText = registerBtn?.textContent;
    
    if (registerBtn) {
        registerBtn.disabled = true;
        registerBtn.textContent = '注册中...';
        registerBtn.style.opacity = '0.7';
    }
    
    try {
        const success = await handleRegister(email, password);
        if (success) {
            // 注册成功后切换到登录模式
            setTimeout(() => {
                switchToLoginMode();
                // 清空注册表单
                document.getElementById('registerEmail').value = '';
                document.getElementById('registerPassword').value = '';
                document.getElementById('registerPasswordConfirm').value = '';
            }, 2000);
        }
    } finally {
        // 恢复按钮状态
        if (registerBtn) {
            registerBtn.disabled = false;
            registerBtn.textContent = originalText || '注册';
            registerBtn.style.opacity = '1';
        }
    }
};

/**
 * 处理邮箱输入，提供自动补全建议
 */
// 防抖定时器
let emailInputDebounceTimer = null;

window.handleEmailInput = function(event) {
    const input = event.target;
    const value = input.value.trim();
    
    // 根据输入框ID确定使用哪个建议列表
    const inputId = input.id;
    let suggestionsList;
    
    if (inputId === 'loginEmail') {
        suggestionsList = document.getElementById('loginEmailSuggestionsList');
    } else if (inputId === 'registerEmail') {
        suggestionsList = document.getElementById('registerEmailSuggestionsList');
    } else {
        return;
    }
    
    if (!suggestionsList) return;
    
    // 清除之前的定时器
    if (emailInputDebounceTimer) {
        clearTimeout(emailInputDebounceTimer);
    }
    
    // 防抖：延迟显示建议，避免频繁更新
    emailInputDebounceTimer = setTimeout(() => {
        // 如果输入包含 @，显示建议
        if (value.includes('@')) {
            const atIndex = value.lastIndexOf('@');
            const localPart = value.substring(0, atIndex);
            const domain = value.substring(atIndex + 1);
            
            // 如果本地部分为空，不显示建议
            if (!localPart) {
                suggestionsList.style.display = 'none';
                return;
            }
            
            // 如果域名部分为空或很短，显示建议
            if (!domain || domain.length < 2) {
                const suggestions = ['gmail.com', 'outlook.com', '163.com', 'qq.com'];
                suggestionsList.innerHTML = '';
                suggestionsList.style.display = 'block';
                
                suggestions.forEach(suggestion => {
                    // 如果用户已经开始输入域名，进行过滤匹配
                    if (domain && !suggestion.toLowerCase().startsWith(domain.toLowerCase())) {
                        return;
                    }
                    
                    const item = document.createElement('div');
                    item.className = 'email-suggestion-item';
                    item.innerHTML = `
                        <span class="suggestion-email">${localPart}@<strong>${suggestion}</strong></span>
                    `;
                    item.onclick = () => {
                        input.value = `${localPart}@${suggestion}`;
                        suggestionsList.style.display = 'none';
                        input.focus();
                        // 触发 input 事件，确保验证正常工作
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    };
                    suggestionsList.appendChild(item);
                });
                
                // 如果没有匹配的建议，隐藏列表
                if (suggestionsList.children.length === 0) {
                    suggestionsList.style.display = 'none';
                }
            } else {
                // 如果域名已经完整，隐藏建议
                suggestionsList.style.display = 'none';
            }
        } else {
            // 如果没有 @，隐藏建议
            suggestionsList.style.display = 'none';
        }
    }, 300); // 300ms 防抖延迟
};

// 点击外部时关闭建议列表
document.addEventListener('click', function(event) {
    // 登录邮箱建议列表
    const loginEmailInput = document.getElementById('loginEmail');
    const loginSuggestionsList = document.getElementById('loginEmailSuggestionsList');
    
    if (loginEmailInput && loginSuggestionsList && 
        !loginEmailInput.contains(event.target) && 
        !loginSuggestionsList.contains(event.target)) {
        loginSuggestionsList.style.display = 'none';
    }
    
    // 注册邮箱建议列表
    const registerEmailInput = document.getElementById('registerEmail');
    const registerSuggestionsList = document.getElementById('registerEmailSuggestionsList');
    
    if (registerEmailInput && registerSuggestionsList && 
        !registerEmailInput.contains(event.target) && 
        !registerSuggestionsList.contains(event.target)) {
        registerSuggestionsList.style.display = 'none';
    }
});

/**
 * 显示 rate limit 解决方案弹窗
 */
function showRateLimitSolution(email, waitTime) {
    const modal = document.createElement('div');
    modal.className = 'rate-limit-modal';
    modal.innerHTML = `
        <div class="rate-limit-content">
            <div class="rate-limit-icon">⏰</div>
            <h3>发送验证码过于频繁</h3>
            <p class="rate-limit-desc">由于发送频率限制，请等待 <strong>${waitTime}</strong> 后才能再次发送验证码。</p>
            
            <div class="rate-limit-solutions">
                <h4>💡 解决方案：</h4>
                <div class="solution-item">
                    <strong>方案1：等待后重试</strong>
                    <p>等待 ${waitTime} 后，点击"发送验证码"按钮重试</p>
                </div>
                <div class="solution-item">
                    <strong>方案2：使用其他邮箱</strong>
                    <p>使用不同的邮箱地址（如：${email.includes('@gmail.com') ? 'outlook.com' : 'gmail.com'}）</p>
                </div>
                <div class="solution-item highlight">
                    <strong>方案3：在 Dashboard 创建账号（推荐）</strong>
                    <p>1. 访问 Supabase Dashboard</p>
                    <p>2. Authentication → Users → Add User</p>
                    <p>3. 填写邮箱和密码创建账号</p>
                    <p>4. 创建后可直接登录，不受限制</p>
                </div>
            </div>
            
            <div class="rate-limit-actions">
                <button class="btn btn-primary" onclick="closeRateLimitModal()">我知道了</button>
                <button class="btn btn-secondary" onclick="window.open('https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/auth/users', '_blank')">打开 Dashboard</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeRateLimitModal();
        }
    });
}

/**
 * 关闭 rate limit 解决方案弹窗
 */
window.closeRateLimitModal = function() {
    const modal = document.querySelector('.rate-limit-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }
};

/**
 * 显示邮箱已存在的提示
 */
function showEmailExistsPrompt(email) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // 创建提示内容
    const promptDiv = document.createElement('div');
    promptDiv.className = 'email-exists-prompt';
    promptDiv.innerHTML = `
        <div class="prompt-content">
            <p>该邮箱已注册，是否切换到登录？</p>
            <div class="prompt-actions">
                <button class="btn btn-primary btn-small" onclick="switchToLoginMode('${email}')">去登录</button>
                <button class="btn btn-secondary btn-small" onclick="closeEmailExistsPrompt()">取消</button>
            </div>
        </div>
    `;
    
    // 移除旧的提示
    const oldPrompt = document.querySelector('.email-exists-prompt');
    if (oldPrompt) oldPrompt.remove();
    
    // 添加到页面
    document.body.appendChild(promptDiv);
    
    // 3秒后自动关闭
    setTimeout(() => {
        closeEmailExistsPrompt();
    }, 5000);
}

/**
 * 关闭邮箱已存在提示
 */
window.closeEmailExistsPrompt = function() {
    const prompt = document.querySelector('.email-exists-prompt');
    if (prompt) {
        prompt.style.opacity = '0';
        setTimeout(() => prompt.remove(), 300);
    }
};

window.handleGuestLogin = handleGuestLogin;
window.handleLogout = handleLogout;
window.updateProfileDisplay = updateProfileDisplay;
