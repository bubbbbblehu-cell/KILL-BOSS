/**
 * 认证模块
 * 处理用户登录、注册、登出等功能
 */

import { getSupabaseClient } from './supabase.js';
import { updateUser, clearUser, setGuestMode } from './state.js';
import { startLoginDemo } from './utils.js';
import { switchPage } from './navigation.js';

/**
 * 用户登录
 */
export async function handleLogin(email, password) {
    // 输入验证
    if (!email || !password) {
        alert("请输入邮箱和密码");
        console.warn("⚠️ 登录失败: 邮箱或密码为空");
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
            
            alert(errorMsg);
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
            
            startLoginDemo();
            return true;
        }
    } catch (err) {
        console.error("❌ 登录过程发生异常:", err);
        alert("登录时发生错误，请稍后重试");
        return false;
    }
}

/**
 * 用户注册
 */
export async function handleRegister(email, password) {
    // 输入验证
    if (!email || !password) {
        alert("请输入邮箱和密码");
        console.warn("⚠️ 注册失败: 邮箱或密码为空");
        return false;
    }

    if (password.length < 6) {
        alert("密码长度至少为6位");
        console.warn("⚠️ 注册失败: 密码长度不足");
        return false;
    }

    console.log("📝 ========== 开始注册 ==========");
    console.log("📧 邮箱:", email);
    console.log("🔑 密码长度:", password.length);

    const client = getSupabaseClient();
    if (!client) {
        const errorMsg = "网络连接异常，Supabase 未就绪。请检查：1) 是否已引入 Supabase 脚本 2) 科学上网环境 3) 控制台具体报错";
        alert(errorMsg);
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
            
            alert(errorMsg);
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
                alert("注册成功！请检查邮箱并点击确认链接以完成注册。");
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
                startLoginDemo();
                console.log("📝 ========== 注册完成 ==========");
                return true;
            }
        }
    } catch (err) {
        console.error("❌ 注册过程发生异常:", err);
        alert("注册时发生错误，请稍后重试");
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

// 导出到 window 对象，供 HTML 调用
window.handleLogin = async function() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    await handleLogin(email, password);
};

window.handleRegister = async function() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    await handleRegister(email, password);
};

window.handleGuestLogin = handleGuestLogin;
window.handleLogout = handleLogout;
