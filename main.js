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
const supabaseUrl = 'https://rjqdxxwurocqsewvtdvf.supabase.co';
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

    console.log("尝试登录:", email);

    const client = _supabaseClient || initSupabase();
    if (!client) {
        alert("网络连接异常，Supabase 未就绪。请检查：1) 是否已引入 Supabase 脚本 2) 科学上网环境 3) 控制台具体报错");
        return;
    }

    const { data, error } = await client.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("登录失败: " + error.message);
    } else {
        appState.isLoggedIn = true;
        appState.user = data.user;
        startLoginDemo();
    }
};

window.handleGuestLogin = function() {
    console.log("以游客身份进入");
    appState.isLoggedIn = true;
    appState.isGuest = true;
    appState.user = { id: 'guest', name: '匿名用户' };
    startLoginDemo();
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
    const testClient = supabase.createClient(supabaseUrl, supabaseKey);
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

// ==================== 6. 启动自检（先等 Supabase 就绪再测库） ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log("BOSS KILL 系统加载完成");

    await loadSupabaseAndInit();

    if (!_supabaseClient) {
        console.warn("⚠️ Supabase 未就绪，已切换至【离线预览模式】。请确认：1) HTML 中已加入 <script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0\"></script> 且在本脚本之前；2) 网络可访问 supabase.co");
        console.log("💡 提示: 在浏览器控制台运行 diagnoseSupabase() 进行详细诊断");
        return;
    }

    // 测试数据库连接
    console.log("🔍 开始测试数据库连接...");
    const { data, error } = await _supabaseClient.from('buildings').select('*').limit(1);

    if (error) {
        console.warn("⚠️ 数据库连接受阻，已自动切换至【离线预览模式】");
        console.error("❌ 数据库连接错误详情:");
        console.error("错误消息:", error.message);
        console.error("错误代码:", error.code);
        console.error("错误详情:", error.details);
        console.error("错误提示:", error.hint);
        console.error("完整错误对象:", error);
        
        // 常见错误提示
        if (error.code === 'PGRST116') {
            console.error("💡 提示: 表 'buildings' 不存在，请检查数据库表是否已创建");
        } else if (error.message?.includes('JWT')) {
            console.error("💡 提示: API Key 可能无效，请检查 Supabase 控制台中的 anon/public key");
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            console.error("💡 提示: 网络连接问题，请检查网络或防火墙设置");
        }
        
        console.log("💡 提示: 在浏览器控制台运行 diagnoseSupabase() 进行详细诊断");
    } else {
        console.log("✅ 数据库连接成功，数据已同步");
        console.log("测试查询结果:", data);
    }
});
