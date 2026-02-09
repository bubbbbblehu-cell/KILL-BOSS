/**
 * 主应用初始化模块
 * 负责应用启动和初始化流程
 */

import { loadSupabaseAndInit, checkAndRestoreSession, getSupabaseClient } from './supabase.js';
import { updateUser } from './state.js';
import { switchPage } from './navigation.js';
import { SUPABASE_CONFIG } from './config.js';
import { checkSupabaseConfig, showConfigHelp } from './configChecker.js';

/**
 * 初始化应用
 */
export async function initApp() {
    console.log("🚀 BOSS KILL 系统加载完成");
    
    // 检查 Supabase 配置
    console.log("\n");
    const configOk = checkSupabaseConfig();
    if (!configOk) {
        console.log("\n");
        showConfigHelp();
        console.log("\n⚠️ 请先配置 Supabase 后再使用邮箱验证码登录功能");
        console.log("💡 你仍然可以使用【游客模式】体验应用功能\n");
    }

    // 加载 Supabase
    await loadSupabaseAndInit();
    const client = getSupabaseClient();

    if (!client) {
        console.warn("⚠️ Supabase 未就绪，已切换至【离线预览模式】。请确认：1) HTML 中已加入 <script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@" + SUPABASE_CONFIG.version + "\"></script> 且在本脚本之前；2) 网络可访问 supabase.co");
        console.log("💡 提示: 在浏览器控制台运行 diagnoseSupabase() 进行详细诊断");
        return;
    }

    // 设置认证状态监听
    const { setupAuthListener } = await import('./auth.js');
    setupAuthListener();
    
    // 检查并恢复登录状态
    const session = await checkAndRestoreSession();
    if (session && session.user) {
        console.log("✅ 发现有效会话，自动恢复登录状态");
        console.log("用户信息:", {
            id: session.user.id,
            email: session.user.email
        });
        
        updateUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '用户'
        });
        
        // 更新个人中心显示（延迟执行，确保 DOM 已加载）
        setTimeout(() => {
            const updateFn = window.updateProfileDisplay;
            if (updateFn) updateFn();
        }, 100);
        
        // 如果当前在登录页，切换到首页
        const loginPage = document.getElementById('loginPage');
        if (loginPage && loginPage.classList.contains('active')) {
            switchPage('swipe');
        }
        
        console.log("✅ 登录状态已恢复，可以直接使用应用");
    } else {
        console.log("ℹ️ 未发现有效会话，需要登录");
        
        // 恢复上次登录的邮箱
        const { restoreLastLoginEmail } = await import('./auth.js');
        restoreLastLoginEmail();
    }

    // 测试数据库连接
    console.log("🔍 开始测试数据库连接...");
    
    try {
        const { data, error } = await client.from('buildings').select('*').limit(1);

        if (error) {
            console.warn("⚠️ 数据库连接受阻，已自动切换至【离线预览模式】");
            console.error("❌ 数据库连接错误详情:");
            console.error("错误消息:", error.message);
            console.error("错误代码:", error.code);
            console.error("错误详情:", error.details);
            console.error("错误提示:", error.hint);
            console.error("完整错误对象:", error);
            
            // 常见错误提示和解决方案
            if (error.code === 'PGRST116') {
                console.error("💡 解决方案: 表 'buildings' 不存在");
                console.error("   1. 进入 Supabase 控制台 → Table Editor");
                console.error("   2. 创建 buildings 表");
                console.error("   3. 或修改代码中的表名");
            } else if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('Invalid API key')) {
                console.error("💡 解决方案: API Key 无效或格式错误");
                console.error("   1. 进入 Supabase 控制台 → Project Settings → API");
                console.error("   2. 复制 'anon' 或 'public' key（不是 service_role）");
                console.error("   3. 更新 config.js 中的 SUPABASE_CONFIG.key");
            } else if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
                console.error("💡 解决方案: Row Level Security (RLS) 策略问题");
                console.error("   1. 进入 Supabase 控制台 → Table Editor → buildings 表 → Policies");
                console.error("   2. 添加允许匿名访问的策略，或暂时禁用 RLS");
            } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
                console.error("💡 解决方案: 网络连接问题");
                console.error("   1. 检查网络连接");
                console.error("   2. 检查 Supabase URL 是否正确:", SUPABASE_CONFIG.url);
                console.error("   3. 检查 CORS 设置（Project Settings → API → Allowed Origins）");
                console.error("   4. 尝试在浏览器直接访问:", SUPABASE_CONFIG.url + '/rest/v1/');
            } else {
                console.error("💡 请查看 SUPABASE_CHECKLIST.md 文件获取详细排查步骤");
            }
            
            console.log("💡 提示: 在浏览器控制台运行 diagnoseSupabase() 进行详细诊断");
        } else {
            console.log("✅ 数据库连接成功，数据已同步");
            console.log("测试查询结果:", data);
        }
    } catch (err) {
        console.error("❌ 数据库连接异常:", err);
        console.error("异常类型:", err.name);
        console.error("异常消息:", err.message);
        console.error("完整异常:", err);
        console.error("💡 这可能是网络问题或 Supabase 服务不可用");
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    
    // 如果当前在登录页面，恢复上次登录的邮箱
    const loginPage = document.getElementById('loginPage');
    if (loginPage && loginPage.classList.contains('active')) {
        const { restoreLastLoginEmail } = await import('./auth.js');
        restoreLastLoginEmail();
    }
});
