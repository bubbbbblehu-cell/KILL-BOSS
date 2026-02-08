/**
 * 认证模块
 * 处理用户登录、注册、登出等功能
 */

import { getSupabaseClient } from './supabase.js';
import { updateUser, clearUser, setGuestMode, appState } from './state.js';
import { startLoginDemo, showToast } from './utils.js';
import { switchPage } from './navigation.js';

/**
 * 用户登录
 */
export async function handleLogin(email, password) {
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
        alert(errorMsg);
        console.error("❌", errorMsg);
        return false;
    }

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
            
            // 使用 Toast 显示错误，而不是 alert
            showToast(errorMsg, 'error');
            console.log("🔐 ========== 登录失败 ==========");
            return false;
        } else {
            console.log("✅ 登录成功！");
            console.log("用户信息:", {
                id: data.user.id,
                email: data.user.email,
                created_at: data.user.created_at
            });
            console.log("会话信息:", {
                access_token: data.session?.access_token?.substring(0, 20) + '...',
                expires_at: data.session?.expires_at
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
            
            return true;
        }
    } catch (err) {
        console.error("❌ 登录过程发生异常:", err);
        showToast("登录时发生错误，请稍后重试", 'error');
        return false;
    }
}

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
            
            if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
                errorMsg = "该邮箱已被注册，请直接登录";
            } else if (error.message?.includes('Password')) {
                errorMsg = "密码不符合要求，请使用至少6位字符";
            } else if (error.message?.includes('security purposes') || error.message?.includes('after') || error.message?.includes('seconds')) {
                // 提取等待时间
                const match = error.message.match(/(\d+)\s*seconds?/i);
                const seconds = match ? match[1] : '60';
                errorMsg = `注册请求过于频繁，请等待 ${seconds} 秒后重试\n\n或者：\n1. 在 Supabase Dashboard → Authentication → Users 中直接创建用户\n2. 等待 ${seconds} 秒后重新注册`;
            }
            
            showToast(errorMsg, 'error', 5000);
            console.log("📝 ========== 注册失败 ==========");
            return false;
        } else {
            console.log("✅ 注册成功！");
            console.log("用户信息:", {
                id: data.user?.id,
                email: data.user?.email,
                created_at: data.user?.created_at
            });
            
            // 检查是否需要邮箱验证
            if (data.user && !data.session) {
                showToast("注册成功！请检查邮箱并点击确认链接以完成注册。", 'info', 5000);
                console.log("📧 需要邮箱验证，已发送确认邮件");
                console.log("📝 ========== 注册完成 ==========");
                return false;
            } else {
                // 自动登录
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
    
    // 清空登录表单
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
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
window.handleLogin = async function() {
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    // 设置加载状态
    setLoginButtonLoading(true);
    
    try {
        const success = await handleLogin(email, password);
        if (!success) {
            // 登录失败，保持表单状态
        }
    } finally {
        // 恢复按钮状态
        setLoginButtonLoading(false);
    }
};

window.handleRegister = async function() {
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    // 设置注册按钮加载状态
    const registerBtn = document.querySelector('.login-form .btn-secondary');
    const originalText = registerBtn?.textContent;
    
    if (registerBtn) {
        registerBtn.disabled = true;
        registerBtn.textContent = '注册中...';
        registerBtn.style.opacity = '0.7';
    }
    
    try {
        await handleRegister(email, password);
    } finally {
        // 恢复按钮状态
        if (registerBtn) {
            registerBtn.disabled = false;
            registerBtn.textContent = originalText || '注册新账号';
            registerBtn.style.opacity = '1';
        }
    }
};

window.handleGuestLogin = handleGuestLogin;
window.handleLogout = handleLogout;
window.updateProfileDisplay = updateProfileDisplay;
