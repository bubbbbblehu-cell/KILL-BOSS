/**
 * Supabase 客户端管理模块
 * 负责 Supabase 客户端的初始化和加载
 */

import { SUPABASE_CONFIG } from './config.js';

let _supabaseClient = null;

/**
 * 初始化 Supabase 客户端
 */
export function initSupabase() {
    if (_supabaseClient) return _supabaseClient;
    
    try {
        if (typeof supabase !== 'undefined') {
            _supabaseClient = supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.key,
                {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true
                    }
                }
            );
            console.log("✅ Supabase 客户端已初始化", {
                url: SUPABASE_CONFIG.url,
                keyPrefix: SUPABASE_CONFIG.key.substring(0, 20) + '...'
            });
            return _supabaseClient;
        } else {
            console.warn("⚠️ supabase 对象未定义，可能脚本未加载");
        }
    } catch (err) {
        console.error("❌ Supabase 初始化错误:", err);
        console.error("错误详情:", {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
    }
    return null;
}

/**
 * 动态加载 Supabase 库并初始化
 */
export function loadSupabaseAndInit() {
    return new Promise((resolve) => {
        // 如果已经加载，直接初始化
        if (typeof supabase !== 'undefined') {
            _supabaseClient = initSupabase();
            resolve(_supabaseClient);
            return;
        }
        
        // 动态加载 Supabase 脚本
        const script = document.createElement('script');
        script.src = `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@${SUPABASE_CONFIG.version}`;
        script.async = true;
        
        script.onload = () => {
            try {
                if (typeof supabase !== 'undefined') {
                    _supabaseClient = supabase.createClient(
                        SUPABASE_CONFIG.url,
                        SUPABASE_CONFIG.key,
                        {
                            auth: {
                                persistSession: true,
                                autoRefreshToken: true
                            }
                        }
                    );
                    console.log("✅ Supabase 已通过 CDN 加载并初始化");
                } else {
                    console.error("❌ 脚本加载完成但 supabase 对象仍不可用");
                }
            } catch (e) {
                console.error("❌ Supabase 动态加载后初始化失败:", e);
                console.error("错误详情:", {
                    message: e.message,
                    stack: e.stack,
                    name: e.name
                });
            }
            resolve(_supabaseClient);
        };
        
        script.onerror = (error) => {
            console.error("❌ 无法加载 Supabase 脚本，请检查网络或科学上网环境");
            console.error("脚本加载错误:", error);
            console.error("尝试加载的 URL:", script.src);
            resolve(null);
        };
        
        document.head.appendChild(script);
    });
}

/**
 * 获取 Supabase 客户端实例
 */
export function getSupabaseClient() {
    return _supabaseClient || initSupabase();
}

/**
 * 检查并恢复登录会话
 */
export async function checkAndRestoreSession() {
    const client = getSupabaseClient();
    if (!client) {
        console.log("⚠️ Supabase 未就绪，跳过会话检查");
        return null;
    }

    try {
        console.log("🔍 检查登录状态...");
        const { data: { session }, error } = await client.auth.getSession();
        
        if (error) {
            console.warn("⚠️ 获取会话失败:", error.message);
            return null;
        }

        return session;
    } catch (err) {
        console.error("❌ 检查会话时发生异常:", err);
        return null;
    }
}
