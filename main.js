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
const supabaseKey = 'sb_publishable_HDVosfE-j_H7Hogv79aq-A_NwrN0Xsd';

let _supabaseClient;
try {
    if (typeof supabase !== 'undefined') {
        _supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    }
} catch (err) {
    console.error("初始化错误:", err);
}

// ==================== 3. 核心功能函数 (全部挂载到 window) ====================

// 登录逻辑
window.handleLogin = async function() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    console.log("尝试登录:", email);
    
    if (!_supabaseClient) return alert("网络连接异常，请检查科学上网环境或稍后再试");

    const { data, error } = await _supabaseClient.auth.signInWithPassword({
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

// 游客登录
window.handleGuestLogin = function() {
    console.log("以游客身份进入");
    appState.isLoggedIn = true;
    appState.isGuest = true;
    appState.user = { id: 'guest', name: '匿名用户' };
    startLoginDemo();
};

// 关键修复：跳过演示函数
window.skipDemo = function() {
    const overlay = document.getElementById('demoOverlay');
    if (overlay) overlay.classList.remove('show');
    window.switchPage('swipe');
};

// 页面切换
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
    
    // 自动播放逻辑（可选）
    document.getElementById('demoEmoji').textContent = "💩";
    document.getElementById('demoText').textContent = "准备好解压了吗？";
}

// ==================== 5. 启动自检 ====================
// 修改主代码中的启动自检部分
document.addEventListener('DOMContentLoaded', () => {
    console.log("BOSS KILL 系统加载完成");
    
    if (_supabaseClient) {
        _supabaseClient.from('buildings').select('*').limit(1).then(({data, error}) => {
            if (error) {
                console.warn("⚠️ 数据库连接受阻，已自动切换至【离线预览模式】");
                // 可以在这里加载一些本地假数据给 appState
            } else {
                console.log("✅ 数据库连接成功，数据已同步");
            }
        });
    }
});
