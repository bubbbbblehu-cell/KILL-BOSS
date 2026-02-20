/**
 * Supabase 配置检测工具
 * 用于检测 Supabase 配置是否正确
 */

import { SUPABASE_CONFIG } from './config.js';

/**
 * 检测 Supabase 配置
 */
export function checkSupabaseConfig() {
    console.log("🔍 ========== Supabase 配置检测 ==========");
    
    const issues = [];
    const warnings = [];
    
    // 检查 URL
    console.log("📍 URL:", SUPABASE_CONFIG.url);
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.url.includes('supabase.co')) {
        issues.push("❌ Supabase URL 配置错误");
    } else {
        console.log("✅ URL 配置正确");
    }
    
    // 检查 Key
    console.log("🔑 Key 前缀:", SUPABASE_CONFIG.key.substring(0, 20) + '...');
    
    if (!SUPABASE_CONFIG.key) {
        issues.push("❌ Supabase Key 未配置");
    } else if (SUPABASE_CONFIG.key.includes('请替换') || SUPABASE_CONFIG.key.includes('你的')) {
        issues.push("❌ Supabase Key 需要替换为实际的 key");
        console.log("💡 请访问 Supabase Dashboard 获取正确的 anon key");
        console.log("   链接: https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/settings/api");
    } else if (!SUPABASE_CONFIG.key.startsWith('eyJ')) {
        issues.push("❌ Supabase Key 格式错误（应该以 eyJ 开头）");
    } else if (SUPABASE_CONFIG.key.length < 100) {
        warnings.push("⚠️ Supabase Key 长度可能不正确（通常应该很长）");
    } else {
        console.log("✅ Key 格式看起来正确");
    }
    
    // 检查版本
    console.log("📦 Supabase JS 版本:", SUPABASE_CONFIG.version);
    if (!SUPABASE_CONFIG.version) {
        warnings.push("⚠️ 未指定 Supabase JS 版本");
    } else {
        console.log("✅ 版本配置正确");
    }
    
    // 检查 Supabase 对象是否可用
    if (typeof supabase === 'undefined') {
        issues.push("❌ Supabase 脚本未加载");
        console.log("💡 可能的原因：");
        console.log("   1. 网络连接问题");
        console.log("   2. CDN 被屏蔽（需要科学上网）");
        console.log("   3. 脚本加载顺序错误");
    } else {
        console.log("✅ Supabase 脚本已加载");
    }
    
    // 输出检测结果
    console.log("\n📊 ========== 检测结果 ==========");
    
    if (issues.length === 0 && warnings.length === 0) {
        console.log("✅ 配置完全正确！");
        return true;
    }
    
    if (issues.length > 0) {
        console.log("\n❌ 发现以下问题：");
        issues.forEach(issue => console.log("  " + issue));
    }
    
    if (warnings.length > 0) {
        console.log("\n⚠️ 发现以下警告：");
        warnings.forEach(warning => console.log("  " + warning));
    }
    
    console.log("\n📖 详细配置指南请查看: EMAIL_VERIFICATION_SETUP.md");
    console.log("🔐 ========== 检测完成 ==========\n");
    
    return issues.length === 0;
}

/**
 * 测试 Supabase 连接
 */
export async function testSupabaseConnection() {
    console.log("🔌 ========== 测试 Supabase 连接 ==========");
    
    if (typeof supabase === 'undefined') {
        console.error("❌ Supabase 脚本未加载，无法测试连接");
        return false;
    }
    
    try {
        const client = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.key
        );
        
        console.log("⏳ 正在测试连接...");
        
        // 尝试获取会话（不需要登录）
        const { data, error } = await client.auth.getSession();
        
        if (error) {
            console.error("❌ 连接失败:", error.message);
            console.log("💡 可能的原因：");
            console.log("   1. API Key 不正确");
            console.log("   2. URL 配置错误");
            console.log("   3. 网络连接问题");
            return false;
        }
        
        console.log("✅ 连接成功！");
        console.log("📊 当前会话:", data.session ? "已登录" : "未登录");
        console.log("🔌 ========== 测试完成 ==========\n");
        return true;
        
    } catch (err) {
        console.error("❌ 测试过程发生异常:", err);
        return false;
    }
}

/**
 * 显示配置帮助信息
 */
export function showConfigHelp() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  Supabase 配置帮助                              ║
╚════════════════════════════════════════════════════════════════╝

📝 配置步骤：

1️⃣ 获取 API Key
   访问: https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/settings/api
   复制 "anon public" key（以 eyJ 开头的长字符串）

2️⃣ 更新配置文件
   打开: src/js/config.js
   替换 SUPABASE_CONFIG.key 为你复制的 key

3️⃣ 配置邮件服务（可选，用于发送验证码）
   访问: https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/settings/auth
   配置 SMTP 设置（推荐使用 Gmail 或其他邮件服务）

4️⃣ 测试配置
   在浏览器控制台运行:
   > checkSupabaseConfig()
   > testSupabaseConnection()

📖 详细文档: EMAIL_VERIFICATION_SETUP.md

💡 快速测试: 
   如果只是想测试功能，可以在 Supabase Dashboard 手动创建用户
   然后使用邮箱验证码登录

╔════════════════════════════════════════════════════════════════╗
║  遇到问题？查看控制台错误信息或阅读 EMAIL_VERIFICATION_SETUP.md  ║
╚════════════════════════════════════════════════════════════════╝
    `);
}

// 导出到 window 对象，方便在控制台调用
if (typeof window !== 'undefined') {
    window.checkSupabaseConfig = checkSupabaseConfig;
    window.testSupabaseConnection = testSupabaseConnection;
    window.showConfigHelp = showConfigHelp;
}











