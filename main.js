// ==================== Supabase 初始化 ====================
// 使用 _supabase 避免与 SDK 全局变量冲突
const supabaseUrl = 'https://rjqdxxwurocqsewvtdvf.supabase.co';
const supabaseKey = 'sb_publishable_HDVosfE-j_H7Hogv79aq-A_NwrN0Xsd';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ==================== 核心登录函数 ====================
// 使用 window.xxx 确保 HTML 按钮能点通
window.handleLogin = async function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    log('request', 'POST', 'Supabase/Auth/SignIn', { email });
    
    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        log('error', '', '登录失败', error.message);
        showToast("登录失败: " + error.message);
    } else {
        log('response', '', '登录成功', data.user.email);
        appState.isLoggedIn = true;
        appState.user = data.user;
        showToast("登录成功！");
        startLoginDemo(); // 进入演示动画
    }
};

// 游客登录逻辑
window.handleGuestLogin = async function() {
    log('event', '', '尝试以游客身份进入');
    appState.isLoggedIn = true;
    appState.isGuest = true;
    appState.user = { id: 'guest_' + Date.now(), name: '匿名老板克星' };
    showToast('以游客身份登录');
    startLoginDemo();
};

// 数据库连接测试
window.testDbConnection = async function() {
    const { data, error } = await _supabase.from('buildings').select('*').limit(1);
    if (error) {
        log('error', '', '数据库预连接失败', error.message);
    } else {
        log('event', '', '数据库预连接成功，已获取建筑数据');
    }
};

// ==================== 全局状态 ====================
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

// 激励文字库
const motivationalQuotes = [
    "在最好的青春里，在格子间里激励自己开出最美的花！",
    "工作虽苦，但扔大便的快乐谁懂？",
    "老板再坏，也挡不住你扔便便的决心！",
    "每一坨便便，都是对996的无声抗议",
    "今天你扔的不是便便，是对未来的期许",
    "压力大？那就多扔几坨！",
    "打工人打工魂，扔便便解压才是人上人"
];

// Top3 数据
const top3Data = [
    { id: 'top1', rank: 1, title: '秃头老板', author: '打工人A', likes: 1520, dislikes: 23 },
    { id: 'top2', rank: 2, title: '穿格子衫的PM', author: '码农小王', likes: 1280, dislikes: 45 },
    { id: 'top3', rank: 3, title: '加班狂魔', author: '摸鱼达人', likes: 986, dislikes: 12 }
];

// 内容流数据
const contentData = [
    { id: 'c1', emoji: '👔', title: '我的老板每天穿同一件衣服', desc: '画了一个永远穿西装的老板', author: '小明', likes: 328, favorites: 56 },
    { id: 'c2', emoji: '🤓', title: '戴眼镜的项目经理', desc: '总是盯着你的工位看', author: '程序猿', likes: 456, favorites: 89 },
    { id: 'c3', emoji: '😤', title: '开会最爱说的那个人', desc: '这个需求很简单嘛', author: '产品汪', likes: 892, favorites: 156 }
];

// ==================== 日志系统 ====================
function log(type, method, path, data = null) {
    const consoleBody = document.getElementById('consoleBody');
    if (!consoleBody) return;
    const time = new Date().toLocaleTimeString();
    const typeClass = { request: 'req', response: 'res', error: 'err', event: 'evt' }[type] || 'evt';
    const typeLabel = { request: 'REQUEST', response: 'RESPONSE', error: 'ERROR', event: 'EVENT' }[type] || 'LOG';
    
    let content = '';
    if (type === 'request') {
        content = `${method} ${path}`;
        if (data) content += ` | ${JSON.stringify(data)}`;
    } else if (type === 'response') {
        content = `${path} → ${JSON.stringify(data)}`;
    } else if (type === 'error') {
        content = data;
    } else {
        content = data || path;
    }

    const logHtml = `
        <div class="console-log ${type}">
            <span class="log-time">${time}</span>
            <span class="log-type ${typeClass}">[${typeLabel}]</span>
            <span class="log-content">${content}</span>
        </div>
    `;
    consoleBody.insertAdjacentHTML('beforeend', logHtml);
    consoleBody.scrollTop = consoleBody.scrollHeight;
}

window.clearConsole = function() {
    document.getElementById('consoleBody').innerHTML = '';
    log('event', '', '控制台已清空');
};

// ==================== UI 辅助函数 ====================
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// 模拟API延迟（保留用于非核心逻辑测试）
function simulateAPI(method, path, data, responseData, delay = 300) {
    return new Promise((resolve) => {
        log('request', method, path, data);
        setTimeout(() => {
            log('response', '', path, responseData);
            resolve(responseData);
        }, delay);
    });
}

// ==================== 登录演示动画 ====================
let demoStep = 0;
const demoSteps = [
    { emoji: '👔', text: '这是你的老板...', duration: 2000 },
    { emoji: '😤', text: '他又让你加班了', duration: 2000 },
    { emoji: '💩', text: '是时候报复了！', duration: 2000 },
    { emoji: '🎯', text: '把便便扔到地图上', duration: 2000, quote: true }
];

function startLoginDemo() {
    const overlay = document.getElementById('demoOverlay');
    if (overlay) overlay.classList.add('show');
    demoStep = 0;
    playDemoStep();
}

async function playDemoStep() {
    const overlay = document.getElementById('demoOverlay');
    if (!overlay || !overlay.classList.contains('show')) return;

    if (demoStep >= demoSteps.length) {
        window.skipDemo();
        return;
    }

    const step = demoSteps[demoStep];
    document.getElementById('demoEmoji').textContent = step.emoji;
    document.getElementById('demoText').textContent = step.text;
    
    if (step.quote) {
        document.getElementById('demoQuote').textContent = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    } else {
        document.getElementById('demoQuote').textContent = '';
    }

    const progressBar = document.getElementById('demoProgress');
    progressBar.style.width = '0%';
    let progress = 0;
    const interval = setInterval(() => {
        progress += 100 / (step.duration / 50);
        progressBar.style.width = Math.min(progress, 100) + '%';
        if (progress >= 100) {
            clearInterval(interval);
            demoStep++;
            setTimeout(playDemoStep, 200);
        }
    }, 50);
}

window.skipDemo = function() {
    document.getElementById('demoOverlay').classList.remove('show');
    window.switchPage('swipe');
    loadSwipeContent();
};

// ==================== 滑一滑/地图/绘画 (逻辑简化版) ====================
async function loadSwipeContent() {
    renderTop3(top3Data);
    renderContentFeed(contentData);
}

function renderTop3(data) {
    const container = document.getElementById('bannerScroll');
    if (!container) return;
    container.innerHTML = data.map(item => `
        <div class="banner-card">
            <div class="banner-rank">${item.rank}</div>
            <div class="banner-info">
                <h4>${item.title}</h4>
                <div class="banner-stats"><span>❤️ ${item.likes}</span></div>
            </div>
        </div>
    `).join('');
}

function renderContentFeed(data) {
    const container = document.getElementById('contentFeed');
    if (!container) return;
    container.innerHTML = data.map(item => `
        <div class="content-card">
            <div class="card-image">${item.emoji}</div>
            <div class="card-body">
                <div class="card-title">${item.title}</div>
                <div class="card-desc">${item.desc}</div>
            </div>
        </div>
    `).join('');
}

window.switchPage = function(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageId = pageName + 'Page';
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        log('event', '', '切换到页面: ' + pageName);
    }
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    log('event', '', 'BOSS KILL 系统启动成功');
    window.testDbConnection(); // 启动时检查一次数据库
});
