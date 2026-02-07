// ==================== 1. 全局状态 (必须放在最前面) ====================
// 这样 handleLogin 才能找到 appState
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

// 检查库是否加载成功，避免 "Cannot access 'supabase'" 错误
let _supabase;
if (typeof supabase !== 'undefined') {
    _supabase = supabase.createClient(supabaseUrl, supabaseKey);
} else {
    console.error("Supabase SDK 未加载，请检查 index.html 是否引入了脚本");
}

// ==================== 3. 核心功能函数 ====================
window.handleLogin = async function() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!_supabase) return alert("系统初始化失败，请检查网络");
    
    const { data, error } = await _supabase.auth.signInWithPassword({
        email: emailInput.value,
        password: passwordInput.value
    });

    if (error) {
        alert("登录失败: " + error.message);
    } else {
        appState.isLoggedIn = true;
        appState.user = data.user;
        alert("登录成功！");
        startLoginDemo();
    }
};

window.handleGuestLogin = function() {
    appState.isLoggedIn = true;
    appState.isGuest = true;
    appState.user = { name: "游客用户" };
    startLoginDemo();
};

// ==================== 4. UI 与 动画逻辑 ====================
function startLoginDemo() {
    const overlay = document.getElementById('demoOverlay');
    if (overlay) overlay.classList.add('show');
    // 逻辑省略...
    window.switchPage('swipe');
}

window.switchPage = function(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageName + 'Page');
    if (target) target.classList.add('active');
};

// ==================== 5. 启动执行 (必须放在最后) ====================
// 这样在调用时，前面的变量都已经定义好了
document.addEventListener('DOMContentLoaded', () => {
    console.log("BOSS KILL 启动成功");
    if (_supabase) {
        // 测试连接
        _supabase.from('buildings').select('*').limit(1).then(({error}) => {
            if (!error) console.log("数据库连接正常");
        });
    }
});
