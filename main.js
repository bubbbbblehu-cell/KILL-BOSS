// 不要用 const supabase，改个名字避免冲突
const supabaseClient = supabase.createClient(
    'https://rjqdxxwurocqsewvtdvf.supabase.co', 
    'sb_publishable_HDVosfE-j_H7Hogv79aq-A_NwrN0Xsd'
);

// 必须定义 handleLogin 函数，否则按钮找不到它
window.handleLogin = async function() {
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;
    
    console.log("尝试登录:", email);
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("登录失败: " + error.message);
    } else {
        alert("登录成功！");
        window.location.href = 'game.html'; // 跳转到游戏主界面
    }
};

testDbConnection();
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

function clearConsole() {
    document.getElementById('consoleBody').innerHTML = '';
    log('event', '', '控制台已清空');
}

// ==================== Toast ====================
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ==================== 模拟API延迟 ====================
function simulateAPI(method, path, data, responseData, delay = 300) {
    return new Promise((resolve) => {
        log('request', method, path, data);
        setTimeout(() => {
            log('response', '', path, responseData);
            resolve(responseData);
        }, delay);
    });
}

// ==================== 登录相关 ====================
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const response = await simulateAPI('POST', '/api/auth/login', 
        { email, password: '******' },
        { success: true, user: { id: 'user_001', email, name: email.split('@')[0] }, token: 'jwt_token_xxx' }
    );

    if (response.success) {
        appState.isLoggedIn = true;
        appState.isGuest = false;
        appState.user = response.user;
        showToast('登录成功！');
        startLoginDemo();
    }
}

async function handleRegister() {
    const email = document.getElementById('loginEmail').value;
    await simulateAPI('POST', '/api/auth/register', 
        { email },
        { success: true, message: '注册成功，请查收验证邮件' }
    );
    showToast('注册请求已发送！');
}

async function handleGuestLogin() {
    const response = await simulateAPI('POST', '/api/auth/guest', 
        {},
        { success: true, user: { id: 'guest_xxx', name: '游客用户', isGuest: true } }
    );

    if (response.success) {
        appState.isLoggedIn = true;
        appState.isGuest = true;
        appState.user = response.user;
        showToast('以游客身份登录');
        startLoginDemo();
    }
}

async function handleLogout() {
    await simulateAPI('POST', '/api/auth/logout', {}, { success: true });
    appState.isLoggedIn = false;
    appState.user = null;
    switchPage('login');
    showToast('已退出登录');
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
    overlay.classList.add('show');
    demoStep = 0;
    playDemoStep();
}

async function playDemoStep() {
    if (demoStep >= demoSteps.length) {
        skipDemo();
        return;
    }

    const step = demoSteps[demoStep];
    document.getElementById('demoEmoji').textContent = step.emoji;
    document.getElementById('demoText').textContent = step.text;
    
    if (step.quote) {
        // 调用激励文字API
        const response = await simulateAPI('GET', '/api/quotes/random', null, 
            { success: true, data: { text: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)] } }
        );
        document.getElementById('demoQuote').textContent = response.data.text;
    } else {
        document.getElementById('demoQuote').textContent = '';
    }

    // 进度条动画
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

function skipDemo() {
    document.getElementById('demoOverlay').classList.remove('show');
    switchPage('swipe');
    loadSwipeContent();
}

// ==================== 滑一滑服务 ====================
async function loadSwipeContent() {
    // 加载Top3
    const top3Response = await simulateAPI('GET', '/api/swipe/top3', { user_id: appState.user?.id }, 
        { success: true, data: top3Data }
    );
    renderTop3(top3Response.data);

    // 加载内容流
    const feedResponse = await simulateAPI('GET', '/api/swipe/feed', { page: 1, page_size: 10 }, 
        { success: true, data: contentData }
    );
    renderContentFeed(feedResponse.data);

    // 随机弹出绘画引导
    setTimeout(() => {
        if (Math.random() > 0.5) {
            document.getElementById('drawPromptModal').classList.add('show');
            log('event', '', '显示绘画引导弹窗');
        }
    }, 3000);
}

function renderTop3(data) {
    const container = document.getElementById('bannerScroll');
    container.innerHTML = data.map(item => `
        <div class="banner-card" onclick="viewContent('${item.id}')">
            <div class="banner-rank">${item.rank}</div>
            <div class="banner-info">
                <h4>${item.title}</h4>
                <div class="banner-stats">
                    <span>❤️ ${item.likes}</span>
                    <span>👎 ${item.dislikes}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderContentFeed(data) {
    const container = document.getElementById('contentFeed');
    container.innerHTML = data.map(item => `
        <div class="content-card">
            <div class="card-image">${item.emoji}</div>
            <div class="card-body">
                <div class="card-author">
                    <div class="author-avatar">👤</div>
                    <span class="author-name">${item.author}</span>
                </div>
                <div class="card-title">${item.title}</div>
                <div class="card-desc">${item.desc}</div>
                <div class="card-actions">
                    <button class="action-btn ${appState.likedContents.has(item.id) ? 'liked' : ''}" 
                            onclick="toggleLike('${item.id}', this)">
                        ❤️ <span>${item.likes + (appState.likedContents.has(item.id) ? 1 : 0)}</span>
                    </button>
                    <button class="action-btn ${appState.favoritedContents.has(item.id) ? 'favorited' : ''}" 
                            onclick="toggleFavorite('${item.id}', this)">
                        ⭐ <span>${item.favorites + (appState.favoritedContents.has(item.id) ? 1 : 0)}</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function toggleLike(contentId, btn) {
    const isLiked = appState.likedContents.has(contentId);
    const method = isLiked ? 'DELETE' : 'POST';
    
    await simulateAPI(method, '/api/swipe/like', 
        { user_id: appState.user?.id, content_id: contentId },
        { success: true, new_like_count: 329 }
    );

    if (isLiked) {
        appState.likedContents.delete(contentId);
        btn.classList.remove('liked');
    } else {
        appState.likedContents.add(contentId);
        btn.classList.add('liked');
    }
    showToast(isLiked ? '已取消点赞' : '点赞成功！');
}

async function toggleFavorite(contentId, btn) {
    const isFavorited = appState.favoritedContents.has(contentId);
    const method = isFavorited ? 'DELETE' : 'POST';
    
    await simulateAPI(method, '/api/swipe/favorite', 
        { user_id: appState.user?.id, content_id: contentId },
        { success: true }
    );

    if (isFavorited) {
        appState.favoritedContents.delete(contentId);
        btn.classList.remove('favorited');
    } else {
        appState.favoritedContents.add(contentId);
        btn.classList.add('favorited');
    }
    showToast(isFavorited ? '已取消收藏' : '收藏成功！');
}

// ==================== 地图服务 ====================
async function loadMapData() {
    const response = await simulateAPI('GET', '/api/map/global', null, {
        success: true,
        data: {
            total_shit_points: appState.poopCount,
            total_towers: appState.towerCount,
            total_occupied_buildings: appState.buildingCount
        }
    });

    document.getElementById('poopCount').textContent = appState.poopCount;
    document.getElementById('towerCount').textContent = appState.towerCount;
    document.getElementById('buildingCount').textContent = appState.buildingCount;
}

async function throwPoop() {
    const container = document.getElementById('mapContainer');
    const x = 50 + Math.random() * 250;
    const y = 80 + Math.random() * 400;

    const response = await simulateAPI('POST', '/api/map/shit-points', 
        { user_id: appState.user?.id, latitude: (30 + Math.random()).toFixed(4), longitude: (120 + Math.random()).toFixed(4) },
        { success: true, shit_id: 'poop_' + Date.now(), tower_formed: appState.poopCount > 0 && appState.poopCount % 5 === 4 }
    );

    // 添加便便到地图
    const poop = document.createElement('div');
    poop.className = 'map-poop';
    poop.textContent = '💩';
    poop.style.left = x + 'px';
    poop.style.top = y + 'px';
    container.appendChild(poop);

    appState.poopCount++;
    document.getElementById('poopCount').textContent = appState.poopCount;

    // 检查是否形成屎塔
    if (response.tower_formed) {
        appState.towerCount++;
        document.getElementById('towerCount').textContent = appState.towerCount;
        showToast('🎉 恭喜！形成了一座新的屎塔！');
        log('event', '', '屎塔生成！当前屎塔数: ' + appState.towerCount);
        
        // 显示屎塔
        const tower = document.createElement('div');
        tower.className = 'map-tower';
        tower.innerHTML = `
            <div class="tower-stack">💩💩💩</div>
            <div class="tower-label">屎塔</div>
        `;
        tower.style.left = x + 'px';
        tower.style.top = y + 'px';
        container.appendChild(tower);
    }

    showToast('💩 便便已投放！');
}

// ==================== 绘画服务 ====================
let canvas, ctx;
let isDrawing = false;
let currentColor = '#000';
let brushWidth = 5;
let history = [];
let historyIndex = -1;

function initCanvas() {
    canvas = document.getElementById('drawCanvas');
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);

    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', endDraw);
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (e.type === 'touchstart') {
        startDraw({ offsetX: x, offsetY: y });
    } else if (e.type === 'touchmove') {
        draw({ offsetX: x, offsetY: y });
    }
}

function startDraw(e) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
    if (!isDrawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function endDraw() {
    if (isDrawing) {
        isDrawing = false;
        saveHistory();
    }
}

function saveHistory() {
    historyIndex++;
    history = history.slice(0, historyIndex);
    history.push(canvas.toDataURL());
}

function setColor(color, elem) {
    currentColor = color;
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    elem.classList.add('active');
    log('event', '', '切换画笔颜色: ' + color);
}

function setTool(tool, elem) {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    elem.classList.add('active');
    log('event', '', '选择工具: ' + tool);
}

function toggleStickers() {
    const panel = document.getElementById('stickerPanel');
    panel.classList.toggle('show');
    log('event', '', panel.classList.contains('show') ? '打开贴纸面板' : '关闭贴纸面板');
}

function addSticker(emoji) {
    ctx.font = '48px serif';
    ctx.fillText(emoji, 100 + Math.random() * 100, 100 + Math.random() * 100);
    saveHistory();
    log('event', '', '添加贴纸: ' + emoji);
    document.getElementById('stickerPanel').classList.remove('show');
}

function undoDrawing() {
    if (historyIndex > 0) {
        historyIndex--;
        const img = new Image();
        img.src = history[historyIndex];
        img.onload = () => ctx.drawImage(img, 0, 0);
        log('event', '', '撤销操作');
    }
}

function redoDrawing() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const img = new Image();
        img.src = history[historyIndex];
        img.onload = () => ctx.drawImage(img, 0, 0);
        log('event', '', '重做操作');
    }
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
    log('event', '', '清空画布');
}

async function saveDrawing() {
    const imageData = canvas.toDataURL('image/png');
    
    await simulateAPI('POST', '/api/draw/work/save', 
        { user_id: appState.user?.id, image_data: '(base64...)', tags: ['老板', '搞笑'] },
        { success: true, work_id: 'work_' + Date.now(), status: 'draft' }
    );

    showToast('作品已保存！');
    
    // 询问是否提交审核
    if (confirm('是否提交作品审核？')) {
        await simulateAPI('POST', '/api/draw/work/submit', 
            { work_id: 'work_xxx' },
            { success: true, review_status: 'pending' }
        );
        showToast('已提交审核，请等待结果');
    }
}

// ==================== 个人中心 ====================
async function handleCheckin() {
    const response = await simulateAPI('POST', '/api/points/checkin', 
        { user_id: appState.user?.id },
        { success: true, points_earned: 10, total_points: appState.points + 10, streak_days: appState.checkinDays + 1 }
    );

    appState.points = response.total_points;
    appState.checkinDays = response.streak_days;
    document.getElementById('userPoints').textContent = appState.points;
    document.getElementById('userCheckin').textContent = appState.checkinDays;
    showToast(`打卡成功！+${response.points_earned}积分`);
}

async function showMyWorks() {
    await simulateAPI('GET', '/api/draw/works', { user_id: appState.user?.id }, 
        { success: true, data: [{ id: 'w1', title: '我的老板' }] }
    );
    showToast('加载我的作品...');
}

async function showFavorites() {
    await simulateAPI('GET', '/api/user/favorites', { user_id: appState.user?.id }, 
        { success: true, data: [] }
    );
    showToast('加载收藏列表...');
}

async function showNotifications() {
    await simulateAPI('GET', '/api/notify/list', { user_id: appState.user?.id }, 
        { success: true, data: [{ id: 'n1', title: '欢迎加入BOSS KILL！', read: false }] }
    );
    showToast('加载通知列表...');
}

// ==================== 页面切换 ====================
function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    const pageMap = {
        'login': 'loginPage',
        'swipe': 'swipePage',
        'map': 'mapPage',
        'draw': 'drawPage',
        'profile': 'profilePage'
    };

    const pageId = pageMap[pageName];
    if (pageId) {
        document.getElementById(pageId).classList.add('active');
        log('event', '', '切换到页面: ' + pageName);

        // 页面初始化
        if (pageName === 'draw' && !canvas) {
            setTimeout(initCanvas, 100);
        }
        if (pageName === 'map') {
            loadMapData();
        }
        if (pageName === 'profile') {
            updateProfilePage();
        }
    }

    // 更新底部导航（这里简单清空 active，点击元素本身会保持样式）
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
}

function updateProfilePage() {
    if (appState.user) {
        document.getElementById('profileName').textContent = appState.user.name || '游客用户';
        document.getElementById('profileEmail').textContent = appState.user.email || '未绑定邮箱';
    }
    document.getElementById('userPoints').textContent = appState.points;
    document.getElementById('userWorks').textContent = appState.works;
    document.getElementById('userCheckin').textContent = appState.checkinDays;
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function goToDraw() {
    closeModal('drawPromptModal');
    switchPage('draw');
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    log('event', '', 'BOSS KILL 交互测试系统启动');
    log('event', '', '请登录或以游客身份进入');
});
