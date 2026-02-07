// ==================== 1. 最优先定义：全局状态 ====================
// 必须放在最顶部，确保 handleLogin 等函数能找到它
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

// ==================== 2. 初始化 Supabase ====================
const supabaseUrl = 'https://rjqdxxwurocqsewvtdvf.supabase.co';
const supabaseKey = 'sb_publishable_HDVosfE-j_H7Hogv79aq-A_NwrN0Xsd';

// 定义一个内部使用的变量名，避免与 SDK 冲突
let _supabaseClient;

try {
    // 检查全局 supabase 对象是否存在（由 index.html 引入）
    if (typeof supabase !== 'undefined') {
        _supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    } else {
        console.error("Supabase SDK 尚未加载，请检查 index.html 的 script 标签位置");
    }
} catch (err) {
    console.error("Supabase 初始化失败:", err);
}

// ==================== 3. 功能函数定义 ====================
// 将函数挂载到 window，确保 HTML 里的 onclick 能找到它们

// 登录逻辑
window.handleLogin = async function() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) return alert("请输入邮箱和密码");
    if (!_supabaseClient) return alert("数据库未连接");

    console.log("尝试登录:", email);
    
    const { data, error } = await _supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
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

// 游客登录逻辑
window.handleGuestLogin = function() {
    console.log("以游客身份进入");
    appState.isLoggedIn = true;
    appState.isGuest = true;
    appState.user = { id: 'guest', name: '游客' };
    startLoginDemo();
};

// ==================== 4. UI 与 动画逻辑 ====================
function startLoginDemo() {
    const overlay = document.getElementById('demoOverlay');
    if (overlay) overlay.classList.add('show');
    // 动画结束后跳转
    setTimeout(() => {
        window.switchPage('swipe');
    }, 1000);
}

window.switchPage = function(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageName + 'Page');
    if (target) target.classList.add('active');
};

// ==================== 5. 启动自检 (放在最后执行) ====================
// 确保所有变量都初始化完毕后再运行
document.addEventListener('DOMContentLoaded', () => {
    console.log("BOSS KILL 系统加载完成");
    if (_supabaseClient) {
        // 尝试进行一次简单的读取测试
        _supabaseClient.from('buildings').select('*').limit(1).then(({data, error}) => {
            if (error) console.error("数据库预连接失败:", error.message);
            else console.log("数据库连接正常");
        });
    }
});
