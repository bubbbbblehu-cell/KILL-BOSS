// ==================== 1. 全局状态 ====================
const appState = {
    isLoggedIn: false,
    isGuest: false,
    user: null,
    points: 120,
    poopCount: 0,
    towerCount: 0,
    buildingCount: 0,
    checkinDays: 7,
    works: 5,
    likedContents: new Set(),
    favoritedContents: new Set()
};

const motivationalQuotes = [
    "在最好的青春里，在格子间里激励自己开出最美的花！",
    "工作虽苦，但扔大便的快乐谁懂？",
    "老板再坏，也挡不住你扔便便的决心！",
    "每一坨便便，都是对996的无声抗议"
];

// ==================== 2. Supabase 初始化 ====================
const supabaseUrl = 'https://rjqdxxwurocqsewvtduf.supabase.co';
// 请到 Supabase 控制台 → Project Settings → API → 复制 "anon" / "public"  key
// 注意：如果使用 sb_publishable_ 开头的 key，需要 Supabase JS v2.39.0+
const supabaseKey = 'sb_publishable_HDVosfE-j_H7Hogv79aq-A_NwrN0Xsd';

let _supabaseClient = null;

function initSupabase() {
    if (_supabaseClient) return _supabaseClient;
    try {
        if (typeof supabase !== 'undefined') {
            _supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true
                }
            });
            console.log("✅ Supabase 客户端已初始化", {
                url: supabaseUrl,
                keyPrefix: supabaseKey.substring(0, 20) + '...'
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

// 若页面加载时 supabase 还未就绪，则从 CDN 动态加载后再初始化
function loadSupabaseAndInit() {
    return new Promise((resolve) => {
        if (typeof supabase !== 'undefined') {
            _supabaseClient = initSupabase();
            resolve(_supabaseClient);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0';
        script.async = true;
        script.onload = () => {
            try {
                if (typeof supabase !== 'undefined') {
                    _supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, {
                        auth: {
                            persistSession: true,
                            autoRefreshToken: true
                        }
                    });
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

// ==================== 3. 核心功能函数 (全部挂载到 window) ====================

window.handleLogin = async function() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    // 输入验证
    if (!email || !password) {
        alert("请输入邮箱和密码");
        console.warn("⚠️ 登录失败: 邮箱或密码为空");
        return;
    }

    console.log("🔐 ========== 开始登录 ==========");
    console.log("📧 邮箱:", email);
    console.log("🔑 密码:", "*".repeat(password.length));

    const client = _supabaseClient || initSupabase();
    if (!client) {
        const errorMsg = "网络连接异常，Supabase 未就绪。请检查：1) 是否已引入 Supabase 脚本 2) 科学上网环境 3) 控制台具体报错";
        alert(errorMsg);
        console.error("❌", errorMsg);
        return;
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
            
            appState.isLoggedIn = true;
            appState.isGuest = false;
            appState.user = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '用户'
            };
            
            console.log("📱 应用状态已更新:", appState);
            console.log("🔐 ========== 登录完成 ==========");
            
            startLoginDemo();
        }
    } catch (err) {
        console.error("❌ 登录过程发生异常:", err);
        alert("登录时发生错误，请稍后重试");
    }
};

window.handleRegister = async function() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    // 输入验证
    if (!email || !password) {
        alert("请输入邮箱和密码");
        console.warn("⚠️ 注册失败: 邮箱或密码为空");
        return;
    }

    if (password.length < 6) {
        alert("密码长度至少为6位");
        console.warn("⚠️ 注册失败: 密码长度不足");
        return;
    }

    console.log("📝 ========== 开始注册 ==========");
    console.log("📧 邮箱:", email);
    console.log("🔑 密码长度:", password.length);

    const client = _supabaseClient || initSupabase();
    if (!client) {
        const errorMsg = "网络连接异常，Supabase 未就绪。请检查：1) 是否已引入 Supabase 脚本 2) 科学上网环境 3) 控制台具体报错";
        alert(errorMsg);
        console.error("❌", errorMsg);
        return;
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
            }
            
            alert(errorMsg);
            console.log("📝 ========== 注册失败 ==========");
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
            } else {
                // 自动登录
                appState.isLoggedIn = true;
                appState.isGuest = false;
                appState.user = {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.email?.split('@')[0] || '用户'
                };
                console.log("✅ 已自动登录");
                startLoginDemo();
            }
            
            console.log("📝 ========== 注册完成 ==========");
        }
    } catch (err) {
        console.error("❌ 注册过程发生异常:", err);
        alert("注册时发生错误，请稍后重试");
    }
};

window.handleGuestLogin = function() {
    console.log("👤 ========== 游客登录 ==========");
    appState.isLoggedIn = true;
    appState.isGuest = true;
    appState.user = { id: 'guest', name: '匿名用户' };
    console.log("✅ 已切换到游客模式");
    console.log("📱 应用状态:", appState);
    startLoginDemo();
};

window.handleLogout = async function() {
    console.log("🚪 ========== 开始登出 ==========");
    
    const client = _supabaseClient || initSupabase();
    
    // 如果是 Supabase 用户，调用登出 API
    if (client && !appState.isGuest) {
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
    appState.isLoggedIn = false;
    appState.isGuest = false;
    appState.user = null;
    
    console.log("✅ 已清除登录状态");
    console.log("📱 应用状态:", appState);
    console.log("🚪 ========== 登出完成 ==========");
    
    // 返回登录页面
    window.switchPage('login');
    
    // 清空登录表单
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
};

window.skipDemo = function() {
    const overlay = document.getElementById('demoOverlay');
    if (overlay) overlay.classList.remove('show');
    window.switchPage('swipe');
};

window.switchPage = function(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageName + 'Page');
    if (target) {
        target.classList.add('active');
        console.log("已切换到页面:", pageName);
    }
};

// ==================== 4. 辅助逻辑 ====================

function startLoginDemo() {
    const overlay = document.getElementById('demoOverlay');
    if (overlay) overlay.classList.add('show');

    document.getElementById('demoEmoji').textContent = "💩";
    document.getElementById('demoText').textContent = "准备好解压了吗？";
}

// ==================== 5. 诊断函数 ====================
window.diagnoseSupabase = async function() {
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
    console.log("URL:", supabaseUrl);
    console.log("Key 前缀:", supabaseKey.substring(0, 30) + '...');
    console.log("Key 长度:", supabaseKey.length);
    
    // 3. 测试客户端初始化
    console.log("3️⃣ 测试客户端初始化:");
    // 使用新的配置创建测试客户端，避免与现有客户端冲突
    const testClient = supabase.createClient(supabaseUrl, supabaseKey, {
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
};

// ==================== 6. 检查并恢复登录状态 ====================
async function checkAndRestoreSession() {
    const client = _supabaseClient || initSupabase();
    if (!client) {
        console.log("⚠️ Supabase 未就绪，跳过会话检查");
        return false;
    }

    try {
        console.log("🔍 检查登录状态...");
        const { data: { session }, error } = await client.auth.getSession();
        
        if (error) {
            console.warn("⚠️ 获取会话失败:", error.message);
            return false;
        }

        if (session && session.user) {
            console.log("✅ 发现有效会话，自动恢复登录状态");
            console.log("用户信息:", {
                id: session.user.id,
                email: session.user.email
            });
            
            appState.isLoggedIn = true;
            appState.isGuest = false;
            appState.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '用户'
            };
            
            // 如果当前在登录页，切换到首页
            const loginPage = document.getElementById('loginPage');
            if (loginPage && loginPage.classList.contains('active')) {
                window.switchPage('swipe');
            }
            
            return true;
        } else {
            console.log("ℹ️ 未发现有效会话，需要登录");
            return false;
        }
    } catch (err) {
        console.error("❌ 检查会话时发生异常:", err);
        return false;
    }
}

// ==================== 7. 启动自检（先等 Supabase 就绪再测库） ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log("BOSS KILL 系统加载完成");

    await loadSupabaseAndInit();

    if (!_supabaseClient) {
        console.warn("⚠️ Supabase 未就绪，已切换至【离线预览模式】。请确认：1) HTML 中已加入 <script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0\"></script> 且在本脚本之前；2) 网络可访问 supabase.co");
        console.log("💡 提示: 在浏览器控制台运行 diagnoseSupabase() 进行详细诊断");
        return;
    }

    // 检查并恢复登录状态
    const hasSession = await checkAndRestoreSession();
    if (hasSession) {
        console.log("✅ 登录状态已恢复，可以直接使用应用");
    }

    // 测试数据库连接
    console.log("🔍 开始测试数据库连接...");
    
    try {
        const { data, error } = await _supabaseClient.from('buildings').select('*').limit(1);

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
                console.error("   3. 更新 main.js 中的 supabaseKey 变量");
            } else if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
                console.error("💡 解决方案: Row Level Security (RLS) 策略问题");
                console.error("   1. 进入 Supabase 控制台 → Table Editor → buildings 表 → Policies");
                console.error("   2. 添加允许匿名访问的策略，或暂时禁用 RLS");
            } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
                console.error("💡 解决方案: 网络连接问题");
                console.error("   1. 检查网络连接");
                console.error("   2. 检查 Supabase URL 是否正确:", supabaseUrl);
                console.error("   3. 检查 CORS 设置（Project Settings → API → Allowed Origins）");
                console.error("   4. 尝试在浏览器直接访问:", supabaseUrl + '/rest/v1/');
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
});
