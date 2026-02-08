/**
 * 划一划发帖模块 - 榜单功能
 * 处理今日榜单、周榜、月榜、年榜
 */

import { getSupabaseClient } from '../../supabase.js';

let currentLeaderboardType = 'today'; // today, week, month, year

/**
 * 初始化榜单
 */
export async function initLeaderboard() {
    console.log("🏆 初始化榜单...");
    setupLeaderboardTabs();
    await loadLeaderboard('today');
    updateLeaderboardTitle('today');
}

/**
 * 设置榜单标签切换
 */
function setupLeaderboardTabs() {
    const tabs = document.querySelectorAll('.leaderboard-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.dataset.type;
            switchLeaderboard(type);
        });
    });
}

/**
 * 切换榜单类型
 */
export async function switchLeaderboard(type) {
    currentLeaderboardType = type;
    console.log("📊 切换到榜单:", type);
    
    // 更新标签状态
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });
    
    // 更新标题
    updateLeaderboardTitle(type);
    
    // 加载对应榜单数据
    await loadLeaderboard(type);
}

/**
 * 加载榜单数据
 */
async function loadLeaderboard(type) {
    const client = getSupabaseClient();
    const bannerScroll = document.getElementById('bannerScroll');
    
    if (!bannerScroll) return;

    // 计算时间范围
    const { startDate, endDate } = getDateRange(type);
    
    if (!client) {
        console.warn("⚠️ Supabase 未就绪，使用模拟数据");
        renderLeaderboard(bannerScroll, getMockLeaderboard());
        return;
    }

    try {
        const { data, error } = await client
            .from('posts')
            .select(`
                *,
                user:users(id, name, avatar)
            `)
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('likes_count', { ascending: false })
            .limit(3);

        if (error) {
            console.error("❌ 加载榜单失败:", error);
            renderLeaderboard(bannerScroll, getMockLeaderboard());
        } else {
            renderLeaderboard(bannerScroll, data || []);
        }
    } catch (err) {
        console.error("❌ 加载榜单异常:", err);
        renderLeaderboard(bannerScroll, getMockLeaderboard());
    }
}

/**
 * 获取时间范围
 */
function getDateRange(type) {
    const now = new Date();
    const endDate = now.toISOString();
    let startDate;

    switch (type) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            break;
        case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            startDate = weekAgo.toISOString();
            break;
        case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            startDate = monthAgo.toISOString();
            break;
        case 'year':
            const yearAgo = new Date(now);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            startDate = yearAgo.toISOString();
            break;
        default:
            startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    }

    return { startDate, endDate };
}

/**
 * 渲染榜单
 */
function renderLeaderboard(container, posts) {
    if (posts.length === 0) {
        container.innerHTML = '<div class="no-leaderboard">暂无数据</div>';
        return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    
    container.innerHTML = posts.map((post, index) => `
        <div class="leaderboard-item" data-post-id="${post.id}" onclick="viewPost(${post.id})">
            <div class="leaderboard-rank">
                ${index < 3 ? medals[index] : `<span class="rank-number">${index + 1}</span>`}
            </div>
            <div class="leaderboard-content">
                <div class="leaderboard-preview">
                    ${post.image_url ? `<img src="${post.image_url}" alt="帖子预览" class="leaderboard-image">` : ''}
                    ${post.text_content ? `<p class="leaderboard-text">${post.text_content.substring(0, 30)}${post.text_content.length > 30 ? '...' : ''}</p>` : ''}
                </div>
                <div class="leaderboard-info">
                    <div class="leaderboard-author">${post.user?.name || '匿名用户'}</div>
                    <div class="leaderboard-stats">
                        <span class="stat-item">👍 ${post.likes_count || 0}</span>
                        <span class="stat-item">💬 ${post.comments_count || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * 更新榜单标题
 */
export function updateLeaderboardTitle(type) {
    const titleMap = {
        today: '今日榜单',
        week: '本周榜单',
        month: '本月榜单',
        year: '本年榜单'
    };
    
    const titleEl = document.querySelector('.banner-title');
    if (titleEl) {
        titleEl.textContent = `🔥 ${titleMap[type] || '今日榜单'}`;
    }
}

/**
 * 获取模拟榜单数据
 */
function getMockLeaderboard() {
    return [
        {
            id: 1,
            user: { name: '用户A' },
            likes_count: 123,
            comments_count: 45
        },
        {
            id: 2,
            user: { name: '用户B' },
            likes_count: 89,
            comments_count: 23
        },
        {
            id: 3,
            user: { name: '用户C' },
            likes_count: 67,
            comments_count: 12
        }
    ];
}

/**
 * 查看帖子详情
 */
window.viewPost = function(postId) {
    console.log("查看帖子:", postId);
    // TODO: 实现帖子详情页
    // 可以跳转到帖子详情或显示弹窗
};

// 导出到 window
window.switchLeaderboard = switchLeaderboard;
