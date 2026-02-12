/**
 * Swipe Feed Module - Leaderboard Feature
 * Handle daily, weekly, monthly, yearly leaderboards
 */

import { getSupabaseClient } from '../../supabase.js';

let currentLeaderboardType = 'today';

/**
 * Initialize leaderboard
 */
export async function initLeaderboard() {
    console.log("Initialize leaderboard...");
    setupLeaderboardTabs();
    await loadLeaderboard('today');
    updateLeaderboardTitle('today');
}

/**
 * Setup leaderboard tab switching
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
 * Switch leaderboard type
 */
export async function switchLeaderboard(type) {
    currentLeaderboardType = type;
    console.log("Switch to leaderboard:", type);
    
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });
    
    updateLeaderboardTitle(type);
    
    await loadLeaderboard(type);
}

/**
 * Load leaderboard data
 */
async function loadLeaderboard(type) {
    const client = getSupabaseClient();
    const bannerScroll = document.getElementById('bannerScroll');
    
    if (!bannerScroll) return;

    const { startDate, endDate } = getDateRange(type);
    
    if (!client) {
        console.warn("Supabase not ready, using mock data");
        renderLeaderboard(bannerScroll, getMockLeaderboard());
        return;
    }

    try {
        const { data: postsData, error: postsError } = await client
            .from('posts')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('likes_count', { ascending: false })
            .limit(3);

        if (postsError) {
            throw postsError;
        }

        const userIds = [...new Set((postsData || []).map(p => p.user_id))];
        let usersMap = {};
        
        if (userIds.length > 0) {
            try {
                const { data: usersData, error: usersError } = await client
                    .from('users')
                    .select('id, name, avatar_url')
                    .in('id', userIds);
                
                if (!usersError && usersData) {
                    usersMap = usersData.reduce((acc, user) => {
                        acc[user.id] = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar_url
                        };
                        return acc;
                    }, {});
                }
            } catch (usersErr) {
                console.warn("Failed to query users:", usersErr);
            }
        }

        const data = (postsData || []).map(post => ({
            ...post,
            user: usersMap[post.user_id] || {
                id: post.user_id,
                name: post.user_id.split('-')[0] || 'User',
                avatar: null
            }
        }));

        renderLeaderboard(bannerScroll, data || []);
    } catch (err) {
        console.error("Failed to load leaderboard:", err);
        renderLeaderboard(bannerScroll, getMockLeaderboard());
    }
}

/**
 * Get date range
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
 * Render leaderboard
 */
function renderLeaderboard(container, posts) {
    if (posts.length === 0) {
        container.innerHTML = '<div class="no-leaderboard">No data</div>';
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
                    ${post.image_url ? `<img src="${post.image_url}" alt="Post preview" class="leaderboard-image">` : ''}
                    ${post.text_content ? `<p class="leaderboard-text">${post.text_content.substring(0, 30)}${post.text_content.length > 30 ? '...' : ''}</p>` : ''}
                </div>
                <div class="leaderboard-info">
                    <div class="leaderboard-author">${post.user?.name || 'Anonymous'}</div>
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
 * Update leaderboard title
 */
export function updateLeaderboardTitle(type) {
    const titleMap = {
        today: 'Today',
        week: 'This Week',
        month: 'This Month',
        year: 'This Year'
    };
    
    const titleEl = document.querySelector('.banner-title');
    if (titleEl) {
        titleEl.textContent = `🔥 ${titleMap[type] || 'Today'}`;
    }
}

/**
 * Get mock leaderboard data
 */
function getMockLeaderboard() {
    return [
        {
            id: 1,
            user: { name: 'User A' },
            likes_count: 123,
            comments_count: 45
        },
        {
            id: 2,
            user: { name: 'User B' },
            likes_count: 89,
            comments_count: 23
        },
        {
            id: 3,
            user: { name: 'User C' },
            likes_count: 67,
            comments_count: 12
        }
    ];
}

/**
 * View post details
 */
window.viewPost = function(postId) {
    console.log("View post:", postId);
};

window.switchLeaderboard = switchLeaderboard;
