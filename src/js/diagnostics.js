/**
 * 诊断工具模块
 * 提供 Supabase 连接诊断功能
 */

import { SUPABASE_CONFIG } from './config.js';

/**
 * Supabase 连接诊断
 */
export async function diagnoseSupabase() {
    console.log("🔍 ========== Supabase 诊断开始 ==========");
    
    // 1. 检查 Supabase 库是否加载
    console.log("1️⃣ 检查 Supabase 库:");
    if (typeof supabase === 'undefined') {
        console.error("❌ supabase 对象未定义");
        console.log("💡 解决方案: 确保 HTML 中已引入 Supabase 脚本");
        return;
    } else {
        console.log("✅ supabase 对象已加载");
    }
    
    // 2. 检查配置
    console.log("2️⃣ 检查配置:");
    console.log("URL:", SUPABASE_CONFIG.url);
    console.log("Key 前缀:", SUPABASE_CONFIG.key.substring(0, 30) + '...');
    console.log("Key 长度:", SUPABASE_CONFIG.key.length);
    
    // 3. 测试客户端初始化
    console.log("3️⃣ 测试客户端初始化:");
    const testClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key, {
        auth: {
            persistSession: false,  // 测试时不需要持久化会话
            autoRefreshToken: false
        }
    });
    if (testClient) {
        console.log("✅ 客户端创建成功");
    } else {
        console.error("❌ 客户端创建失败");
        return;
    }
    
    // 4. 测试基本连接（ping）
    console.log("4️⃣ 测试基本连接:");
    try {
        const { data: healthData, error: healthError } = await testClient
            .from('_realtime')
            .select('id')
            .limit(1);
        
        if (healthError) {
            console.warn("⚠️ 健康检查失败（这是正常的，_realtime 表可能不存在）");
        } else {
            console.log("✅ 基本连接正常");
        }
    } catch (e) {
        console.error("❌ 连接测试异常:", e);
    }
    
    // 5. 测试目标表
    console.log("5️⃣ 测试目标表 'buildings':");
    const { data, error } = await testClient.from('buildings').select('*').limit(1);
    
    if (error) {
        console.error("❌ 表查询失败");
        console.error("错误代码:", error.code);
        console.error("错误消息:", error.message);
        console.error("错误详情:", error.details);
        
        if (error.code === 'PGRST116') {
            console.log("💡 解决方案: 表 'buildings' 不存在");
            console.log("   请在 Supabase 控制台创建该表，或修改代码中的表名");
        } else if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
            console.log("💡 解决方案: API Key 无效或过期");
            console.log("   请到 Supabase 控制台 → Project Settings → API");
            console.log("   复制正确的 'anon' 或 'public' key");
        } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
            console.log("💡 解决方案: Row Level Security (RLS) 策略问题");
            console.log("   请在 Supabase 控制台检查 RLS 策略设置");
        }
    } else {
        console.log("✅ 表查询成功");
        console.log("查询结果:", data);
    }
    
    console.log("🔍 ========== 诊断完成 ==========");
}

// 导出到 window 对象，供控制台调用
window.diagnoseSupabase = diagnoseSupabase;
