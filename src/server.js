/**
 * BOSS KILL 选项B - 完整后端API服务
 * 直接引用+API对接版本
 * 支持 interactive-demo.html 的所有API调用
 */
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const JWT_SECRET = 'boss-kill-option-b-2024';

app.use(cors());
app.use(express.json());

// ==================== 认证中间件 ====================
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: '未登录' });
    try { req.user = jwt.verify(token, JWT_SECRET); next(); }
    catch (e) { res.status(401).json({ success: false, message: 'Token无效' }); }
};

const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) { try { req.user = jwt.verify(token, JWT_SECRET); } catch (e) {} }
    next();
};

// ==================== 内存数据库 ====================
const DB = {
    users: [
        { id: 1, email: 'test@test.com', password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.QdNP7Tr1E5.uR5PSte', 
          nickname: '测试用户', avatar: '😎', bio: '密码:123456', points: 100, level: 5 }
    ],
    posts: [
        { id: 1, user_id: 1, content: '欢迎来到 BOSS KILL！💩 选项B完整版', status: 1, likes: 156, comments: 23, created_at: new Date().toISOString() },
        { id: 2, user_id: 1, content: '这是直接引用+API对接的版本，功能100%完整！', status: 1, likes: 89, comments: 12, created_at: new Date().toISOString() },
        { id: 3, user_id: 1, content: '老板说今天要加班到12点... 💩💩💩', status: 1, likes: 234, comments: 45, created_at: new Date().toISOString() }
    ],
    likes: [], favorites: [], checkins: [],
    mapPoints: [],
    drawings: [],
    notifications: [
        { id: 1, user_id: 1, type: 'follow', content: '用户A关注了你', read: false, created_at: new Date().toISOString() },
        { id: 2, user_id: 1, type: 'comment', content: '用户B评论了你的帖子', read: false, created_at: new Date().toISOString() },
        { id: 3, user_id: 1, type: 'system', content: '欢迎使用BOSS KILL！', read: true, created_at: new Date().toISOString() }
    ]
};

// 激励文字库
const QUOTES = [
    "今日份的忍耐已用完 💢",
    "摸鱼一时爽，一直摸鱼一直爽 🐟",
    "老板的话，听听就好 👂",
    "加班使我快乐？不存在的 😤",
    "工资没涨，怒气值涨了 📈",
    "打工人打工魂，打工都是人上人 💪",
    "今天也是想辞职的一天 📝",
    "我不是针对谁，我是说在座的各位... 🎯"
];

// ==================== 认证API ====================
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = DB.users.find(u => u.email === email);
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.json({ success: false, message: '账号或密码错误' });
    }
    const token = jwt.sign({ id: user.id, nickname: user.nickname }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safe } = user;
    res.json({ success: true, data: { user: safe, token } });
});

app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (DB.users.find(u => u.email === email)) {
        return res.json({ success: false, message: '邮箱已注册' });
    }
    const hash = await bcrypt.hash(password || '123456', 10);
    const user = { id: DB.users.length + 1, email, password: hash, nickname: email.split('@')[0], avatar: '👤', bio: '', points: 0, level: 1 };
    DB.users.push(user);
    res.json({ success: true, message: '注册成功' });
});

app.post('/api/auth/guest', (req, res) => {
    const user = { id: DB.users.length + 1, nickname: `游客_${uuidv4().slice(0,6)}`, avatar: '👻', bio: '神秘游客', points: 0, level: 1, isGuest: true };
    DB.users.push(user);
    const token = jwt.sign({ id: user.id, nickname: user.nickname }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { user, token } });
});

app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true });
});

// ==================== 帖子API ====================
app.get('/api/post/list', optionalAuth, (req, res) => {
    const posts = DB.posts.filter(p => p.status === 1).map(p => {
        const u = DB.users.find(x => x.id === p.user_id);
        return { 
            ...p, 
            nickname: u?.nickname, 
            avatar: u?.avatar, 
            like_count: p.likes || DB.likes.filter(l => l.post_id === p.id).length,
            isLiked: req.user ? DB.likes.some(l => l.post_id === p.id && l.user_id === req.user.id) : false
        };
    });
    res.json({ success: true, data: { list: posts } });
});

app.post('/api/post/create', auth, (req, res) => {
    const post = { 
        id: DB.posts.length + 1, 
        user_id: req.user.id, 
        content: req.body.content, 
        status: 1, 
        likes: 0,
        comments: 0,
        created_at: new Date().toISOString() 
    };
    DB.posts.push(post);
    res.json({ success: true, data: post });
});

app.post('/api/post/:id/like', auth, (req, res) => {
    const postId = +req.params.id;
    const idx = DB.likes.findIndex(l => l.post_id === postId && l.user_id === req.user.id);
    const post = DB.posts.find(p => p.id === postId);
    if (idx >= 0) { 
        DB.likes.splice(idx, 1); 
        if (post) post.likes = Math.max(0, (post.likes || 1) - 1);
        res.json({ success: true, liked: false }); 
    } else { 
        DB.likes.push({ user_id: req.user.id, post_id: postId }); 
        if (post) post.likes = (post.likes || 0) + 1;
        res.json({ success: true, liked: true }); 
    }
});

app.post('/api/post/:id/favorite', auth, (req, res) => {
    const postId = +req.params.id;
    const idx = DB.favorites.findIndex(f => f.post_id === postId && f.user_id === req.user.id && f.type === 'post');
    if (idx >= 0) { 
        DB.favorites.splice(idx, 1); 
        res.json({ success: true, favorited: false }); 
    } else { 
        DB.favorites.push({ user_id: req.user.id, post_id: postId, type: 'post', created_at: new Date().toISOString() }); 
        res.json({ success: true, favorited: true }); 
    }
});

// ==================== 激励文字API ====================
app.get('/api/quotes/random', (req, res) => {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    res.json({ success: true, data: { quote, category: '职场吐槽' } });
});

// ==================== 滑一滑API ====================
app.get('/api/swipe/cards', optionalAuth, (req, res) => {
    const cards = DB.posts.filter(p => p.status === 1).map((p, i) => {
        const u = DB.users.find(x => x.id === p.user_id);
        return { 
            card_id: i + 1, 
            post_id: p.id, 
            content: p.content, 
            nickname: u?.nickname || '匿名', 
            avatar: u?.avatar || '👤',
            likes: p.likes,
            comments: p.comments
        };
    });
    res.json({ success: true, data: cards });
});

app.get('/api/swipe/top3', (req, res) => {
    const top3 = DB.posts.sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 3).map((p, i) => {
        const u = DB.users.find(x => x.id === p.user_id);
        return { rank: i + 1, content: p.content, likes: p.likes, nickname: u?.nickname };
    });
    res.json({ success: true, data: top3 });
});

app.post('/api/swipe/action', auth, (req, res) => {
    const { cardId, action } = req.body;
    // 记录用户行为（可用于推荐算法）
    res.json({ success: true, message: action === 'like' ? '已喜欢' : '已跳过' });
});

// ==================== 地图API ====================
app.get('/api/map/points', (req, res) => {
    const { latitude, longitude, radius = 5 } = req.query;
    // 返回所有点（简化版）
    res.json({ success: true, data: { points: DB.mapPoints, total: DB.mapPoints.length } });
});

app.post('/api/map/throw', auth, (req, res) => {
    const { latitude, longitude, power } = req.body;
    const point = { 
        id: DB.mapPoints.length + 1, 
        user_id: req.user.id, 
        latitude: latitude || 31.23 + Math.random() * 0.01, 
        longitude: longitude || 121.47 + Math.random() * 0.01,
        power: power || 100,
        created_at: new Date().toISOString() 
    };
    DB.mapPoints.push(point);
    
    // 增加用户积分
    const user = DB.users.find(u => u.id === req.user.id);
    if (user) user.points = (user.points || 0) + 5;
    
    res.json({ success: true, data: { point, pointsEarned: 5 } });
});

app.get('/api/map/stats', (req, res) => {
    res.json({ 
        success: true, 
        data: { 
            totalPoints: DB.mapPoints.length, 
            totalTowers: Math.floor(DB.mapPoints.length / 5),
            todayPoints: DB.mapPoints.filter(p => p.created_at?.startsWith(new Date().toISOString().split('T')[0])).length
        } 
    });
});

app.get('/api/map/landmarks', (req, res) => {
    const landmarks = [
        { id: 1, name: '总部大楼', icon: '🏢', type: 'building', x: 50, y: 30, desc: '老板的巢穴' },
        { id: 2, name: '加班塔', icon: '🗼', type: 'tower', x: 70, y: 50, desc: '996圣地' },
        { id: 3, name: '摸鱼角', icon: '☕', type: 'safe', x: 20, y: 60, desc: '偷闲好去处' },
        { id: 4, name: '食堂', icon: '🍜', type: 'building', x: 40, y: 70, desc: '补充能量' }
    ];
    res.json({ success: true, data: landmarks });
});

// ==================== 绘图API ====================
app.post('/api/drawing/save', auth, (req, res) => {
    const { imageData, tags } = req.body;
    const drawing = {
        id: DB.drawings.length + 1,
        user_id: req.user.id,
        image_data: imageData,
        tags: tags || [],
        status: 'pending',
        created_at: new Date().toISOString()
    };
    DB.drawings.push(drawing);
    res.json({ success: true, data: { id: drawing.id, message: '作品已保存，等待审核' } });
});

app.get('/api/drawing/my', auth, (req, res) => {
    const drawings = DB.drawings.filter(d => d.user_id === req.user.id);
    res.json({ success: true, data: drawings });
});

app.get('/api/stickers', (req, res) => {
    const stickers = [
        { id: 1, emoji: '💩', name: '便便', category: 'basic', unlocked: true },
        { id: 2, emoji: '🎯', name: '靶心', category: 'basic', unlocked: true },
        { id: 3, emoji: '👔', name: '老板', category: 'boss', unlocked: true },
        { id: 4, emoji: '😤', name: '愤怒', category: 'emotion', unlocked: true },
        { id: 5, emoji: '💢', name: '怒火', category: 'emotion', unlocked: true },
        { id: 6, emoji: '🐟', name: '摸鱼', category: 'fun', unlocked: false, unlockPoints: 100 }
    ];
    res.json({ success: true, data: stickers });
});

// ==================== 用户API ====================
app.get('/api/user/profile', auth, (req, res) => {
    const user = DB.users.find(u => u.id === req.user.id);
    if (!user) return res.json({ success: false, message: '用户不存在' });
    const { password: _, ...safe } = user;
    res.json({ 
        success: true, 
        data: { 
            ...safe, 
            postCount: DB.posts.filter(p => p.user_id === user.id).length,
            drawingCount: DB.drawings.filter(d => d.user_id === user.id).length,
            followerCount: Math.floor(Math.random() * 100),
            followingCount: Math.floor(Math.random() * 50)
        } 
    });
});

app.get('/api/user/homepage', auth, (req, res) => {
    const user = DB.users.find(u => u.id === req.user.id);
    res.json({
        success: true,
        data: {
            name: user?.nickname || '游客用户',
            bio: user?.bio || '热爱生活，热爱扔便便 💩',
            posts: DB.posts.filter(p => p.user_id === req.user.id).length,
            followers: 128,
            following: 56,
            likes: '1.2k'
        }
    });
});

app.get('/api/user/posts', auth, (req, res) => {
    const posts = DB.posts.filter(p => p.user_id === req.user.id).map(p => ({
        id: p.id,
        text: p.content,
        image: null,
        likes: p.likes,
        comments: p.comments,
        shares: 0,
        time: '刚刚'
    }));
    res.json({ success: true, data: posts });
});

app.post('/api/user/checkin', auth, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    if (DB.checkins.find(c => c.user_id === req.user.id && c.date === today)) {
        return res.json({ success: false, message: '今日已打卡' });
    }
    DB.checkins.push({ user_id: req.user.id, date: today });
    const user = DB.users.find(u => u.id === req.user.id);
    if (user) user.points = (user.points || 0) + 10;
    
    // 计算连续打卡天数
    const userCheckins = DB.checkins.filter(c => c.user_id === req.user.id).length;
    res.json({ success: true, message: '打卡成功！+10积分', data: { streakDays: userCheckins, pointsEarned: 10 } });
});

app.get('/api/user/checkin/status', auth, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const checkedIn = DB.checkins.some(c => c.user_id === req.user.id && c.date === today);
    const streakDays = DB.checkins.filter(c => c.user_id === req.user.id).length;
    res.json({ success: true, data: { checkedIn, streakDays } });
});

// ==================== 收藏API ====================
app.get('/api/user/favorites', auth, (req, res) => {
    const { type } = req.query; // post, comment, user
    const favorites = DB.favorites.filter(f => f.user_id === req.user.id && (!type || f.type === type));
    res.json({ success: true, data: favorites });
});

// ==================== 通知API ====================
app.get('/api/notifications', auth, (req, res) => {
    const { type } = req.query; // follow, comment, system
    let notifications = DB.notifications.filter(n => n.user_id === req.user.id);
    if (type) notifications = notifications.filter(n => n.type === type);
    res.json({ success: true, data: notifications });
});

app.get('/api/notifications/unread', auth, (req, res) => {
    const count = DB.notifications.filter(n => n.user_id === req.user.id && !n.read).length;
    res.json({ success: true, data: { count } });
});

app.post('/api/notifications/:id/read', auth, (req, res) => {
    const notification = DB.notifications.find(n => n.id === +req.params.id && n.user_id === req.user.id);
    if (notification) notification.read = true;
    res.json({ success: true });
});

// ==================== 健康检查 ====================
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: 'B', features: 'complete' }));

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`🎮 选项B后端运行中: http://localhost:${PORT}`);
    console.log('📋 支持的API:');
    console.log('   - 认证: /api/auth/*');
    console.log('   - 帖子: /api/post/*');
    console.log('   - 激励: /api/quotes/*');
    console.log('   - 滑一滑: /api/swipe/*');
    console.log('   - 地图: /api/map/*');
    console.log('   - 绘图: /api/drawing/*');
    console.log('   - 用户: /api/user/*');
    console.log('   - 通知: /api/notifications/*');
});
