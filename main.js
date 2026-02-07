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
// 请到 Supabase 控制台 → Project Settings → API → 复制 "anon" / "public"  key（通常是一串以 eyJ 开头的 JWT）
const supabaseKey = 'sb_publishable_HDVosfE-j_H7Hogv79aq-A_NwrN0Xsd';

let _supabaseClient = null;

function initSupabase() {
    if (_supabaseClient) return _supabaseClient;
    try {
        if (typeof supabase !== 'undefined') {
            _supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
            console.log("✅ Supabase 客户端已初始化");
            return _supabaseClient;
        }
    } catch (err) {
        console.error("Supabase 初始化错误:", err);
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
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.async = true;
        script.onload = () => {
            try {
                if (typeof supabase !== 'undefined') {
                    _supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
                    console.log("✅ Supabase 已通过 CDN 加载并初始化");
                }
            } catch (e) {
                console.error("Supabase 动态加载后初始化失败:", e);
            }
            resolve(_supabaseClient);
        };
        script.onerror = () => {
            console.error("⚠️ 无法加载 Supabase 脚本，请检查网络或科学上网环境");
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

// ==================== 5. 启动自检（先等 Supabase 就绪再测库） ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log("BOSS KILL 系统加载完成");

    await loadSupabaseAndInit();

    if (!_supabaseClient) {
        console.warn("⚠️ Supabase 未就绪，已切换至【离线预览模式】。请确认：1) HTML 中已加入 <script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2\"></script> 且在本脚本之前；2) 网络可访问 supabase.co");
        return;
    }

    const { data, error } = await _supabaseClient.from('buildings').select('*').limit(1);

    if (error) {
        console.warn("⚠️ 数据库连接受阻，已自动切换至【离线预览模式】");
        console.error("具体错误（便于排查）:", error.message, error);
    } else {
        console.log("✅ 数据库连接成功，数据已同步");
    }
});
