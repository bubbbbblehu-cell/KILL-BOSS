/**
 * notifications.js - 消息通知列表和管理模块
 * BOSS KILL 项目
 */

// 通知数据
const notificationsData = {
    all: [],
    security: [],
    activity: [],
    social: [],
    reward: [],
    system: [],
    currentTab: 'all',
    currentPage: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    unreadCounts: {
        total: 0,
        security: 0,
        activity: 0,
        social: 0,
        reward: 0,
        system: 0
    }
};

// 通知类型映射
const notificationTypeMap = {
    security: { icon: '🔒', label: '安全通知', color: '#ef4444' },
    activity: { icon: '🎉', label: '活动通知', color: '#ffc107' },
    social: { icon: '👥', label: '社交通知', color: '#8b5cf6' },
    reward: { icon: '🎁', label: '奖励通知', color: '#10b981' },
    system: { icon: '📢', label: '系统通知', color: '#06b6d4' }
};

// 通知数据结构
class Notification {
    constructor(data) {
        this.id = data.id;
        this.userId = data.user_id;
        this.title = data.title;
        this.body = data.body;
        this.type = data.notification_type;
        this.priority = data.priority || 'normal';
        this.isRead = data.is_read || false;
        this.data = data.data || {};
        this.createdAt = new Date(data.created_at);
        this.readAt = data.read_at ? new Date(data.read_at) : null;
    }

    getTimeAgo() {
        const now = new Date();
        const diff = now - this.createdAt;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        return this.createdAt.toLocaleDateString('zh-CN');
    }

    getTypeInfo() {
        return notificationTypeMap[this.type] || notificationTypeMap.system;
    }
}

/**
 * 进入消息通知页面
 */
async function goToNotifications() {
    try {
        if (typeof showLoading === 'function') {
            showLoading('加载中...');
        }
        
        // 获取未读数量
        await updateUnreadCounts();
        
        // 重置分页状态
        notificationsData.currentPage = 1;
        notificationsData.hasMore = true;
        
        // 加载通知列表
        await loadNotifications('all');
        
        // 切换到通知页面
        if (typeof switchPage === 'function') {
            switchPage('notifications');
        }
    } catch (error) {
        console.error('加载通知失败:', error);
        showToast('加载失败，请重试');
    } finally {
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
    }
}

/**
 * 更新未读数量
 */
async function updateUnreadCounts() {
    // 模拟API数据
    notificationsData.unreadCounts = {
        total: 5,
        security: 1,
        activity: 2,
        social: 1,
        reward: 1,
        system: 0
    };
    
    // 更新UI徽章
    updateUnreadBadges();
}

/**
 * 更新未读徽章显示
 */
function updateUnreadBadges() {
    const badges = {
        badgeAll: notificationsData.unreadCounts.total,
        badgeSecurity: notificationsData.unreadCounts.security,
        badgeActivity: notificationsData.unreadCounts.activity,
        badgeSocial: notificationsData.unreadCounts.social,
        badgeReward: notificationsData.unreadCounts.reward
    };

    Object.keys(badges).forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.textContent = badges[id] || '';
        }
    });
}

/**
 * 加载通知列表
 */
async function loadNotifications(type = 'all', append = false) {
    if (notificationsData.loading) return;
    
    try {
        notificationsData.loading = true;
        notificationsData.currentTab = type;
        
        // 生成模拟数据
        const mockData = generateMockNotifications(type);
        const notifications = mockData.map(n => new Notification(n));
        
        if (append) {
            notificationsData[type].push(...notifications);
        } else {
            notificationsData[type] = notifications;
        }
        
        notificationsData.hasMore = notificationsData.currentPage < 3;
        renderNotifications(notificationsData[type]);
        
        const loadMoreBtn = document.getElementById('loadMoreNotifications');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = notificationsData.hasMore ? 'block' : 'none';
        }
    } catch (error) {
        console.error('加载通知失败:', error);
        showToast('加载失败，请重试');
    } finally {
        notificationsData.loading = false;
    }
}

/**
 * 生成模拟通知数据
 */
function generateMockNotifications(type) {
    const mockData = {
        all: [
            {
                id: 'notif_001',
                user_id: 'user_001',
                title: '新设备登录提醒',
                body: '您的账号在iPhone 15上登录，位置：杭州。如非本人操作，请立即修改密码。',
                notification_type: 'security',
                priority: 'high',
                is_read: false,
                data: { action: 'view_security' },
                created_at: new Date(Date.now() - 2 * 3600000).toISOString()
            },
            {
                id: 'notif_002',
                user_id: 'user_001',
                title: '新活动上线',
                body: '春节特别活动开始啦！参与活动赢取限定贴纸和积分奖励！',
                notification_type: 'activity',
                priority: 'normal',
                is_read: false,
                data: { action: 'view_activity' },
                created_at: new Date(Date.now() - 5 * 3600000).toISOString()
            },
            {
                id: 'notif_003',
                user_id: 'user_001',
                title: '新粉丝提醒',
                body: '用户"摸鱼达人"关注了你！',
                notification_type: 'social',
                priority: 'normal',
                is_read: true,
                data: { action: 'view_profile' },
                created_at: new Date(Date.now() - 86400000).toISOString()
            }
        ],
        security: [
            {
                id: 'notif_001',
                user_id: 'user_001',
                title: '新设备登录提醒',
                body: '您的账号在iPhone 15上登录，位置：杭州。',
                notification_type: 'security',
                is_read: false,
                created_at: new Date(Date.now() - 2 * 3600000).toISOString()
            }
        ],
        activity: [
            {
                id: 'notif_002',
                user_id: 'user_001',
                title: '新活动上线',
                body: '春节特别活动开始啦！',
                notification_type: 'activity',
                is_read: false,
                created_at: new Date(Date.now() - 5 * 3600000).toISOString()
            }
        ],
        social: [
            {
                id: 'notif_003',
                user_id: 'user_001',
                title: '新粉丝提醒',
                body: '用户"摸鱼达人"关注了你！',
                notification_type: 'social',
                is_read: true,
                created_at: new Date(Date.now() - 86400000).toISOString()
            }
        ],
        reward: [],
        system: []
    };
    
    return mockData[type] || [];
}

/**
 * 渲染通知列表
 */
function renderNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    if (!notifications || notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔔</div>
                <div class="empty-state-text">暂无通知消息</div>
            </div>
        `;
        return;
    }

    container.innerHTML = notifications.map(notif => {
        const typeInfo = notif.getTypeInfo();
        return `
            <div class="notification-item" data-notif-id="${notif.id}" data-is-read="${notif.isRead}">
                <div class="notif-icon notif-icon-${notif.type}">${typeInfo.icon}</div>
                <div class="notif-content">
                    <div class="notif-header">
                        <span class="notif-title">${escapeHtml(notif.title)}</span>
                        <span class="notif-time">${notif.getTimeAgo()}</span>
                    </div>
                    <div class="notif-body">${escapeHtml(notif.body)}</div>
                    ${notif.data.action ? `
                        <div class="notif-actions">
                            <button class="notif-action-btn" onclick="handleNotificationAction('${notif.id}', '${notif.data.action}')">
                                查看详情
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="notif-menu" onclick="showNotificationMenu('${notif.id}')">⋮</div>
                <div class="notif-unread-dot"></div>
            </div>
        `;
    }).join('');
    
    // 为未读通知添加点击事件
    container.querySelectorAll('.notification-item[data-is-read="false"]').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.notif-menu')) {
                markNotificationRead(this.dataset.notifId);
            }
        });
    });
}

/**
 * HTML转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 切换通知标签
 */
function switchNotificationTab(type, elem) {
    document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
    elem.classList.add('active');
    
    notificationsData.currentPage = 1;
    notificationsData.hasMore = true;
    
    loadNotifications(type);
}

/**
 * 标记单条通知已读
 */
async function markNotificationRead(notifId) {
    try {
        // 更新本地数据
        Object.values(notificationsData).forEach(list => {
            if (Array.isArray(list)) {
                const notif = list.find(n => n.id === notifId);
                if (notif) {
                    notif.isRead = true;
                    notif.readAt = new Date();
                }
            }
        });
        
        // 更新UI
        const notifElement = document.querySelector(`[data-notif-id="${notifId}"]`);
        if (notifElement) {
            notifElement.setAttribute('data-is-read', 'true');
        }
        
        // 更新未读数量
        await updateUnreadCounts();
    } catch (error) {
        console.error('标记已读失败:', error);
    }
}

/**
 * 标记全部已读
 */
async function markAllRead() {
    if (!confirm('确定要标记全部通知为已读吗？')) return;
    
    try {
        if (typeof showLoading === 'function') {
            showLoading('处理中...');
        }
        
        // 更新本地数据
        const list = notificationsData[notificationsData.currentTab];
        if (Array.isArray(list)) {
            list.forEach(notif => {
                notif.isRead = true;
                notif.readAt = new Date();
            });
        }
        
        // 重新渲染
        renderNotifications(list);
        
        // 更新未读数量
        await updateUnreadCounts();
        
        showToast('已标记全部为已读');
    } catch (error) {
        console.error('标记全部已读失败:', error);
        showToast('操作失败，请重试');
    } finally {
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
    }
}

/**
 * 处理通知操作
 */
function handleNotificationAction(notifId, action) {
    markNotificationRead(notifId);
    showToast('查看详情');
}

/**
 * 显示通知菜单
 */
function showNotificationMenu(notifId) {
    if (confirm('确定要删除这条通知吗？')) {
        deleteNotification(notifId);
    }
}

/**
 * 删除通知
 */
async function deleteNotification(notifId) {
    try {
        // 从本地数据中移除
        Object.keys(notificationsData).forEach(key => {
            if (Array.isArray(notificationsData[key])) {
                notificationsData[key] = notificationsData[key].filter(n => n.id !== notifId);
            }
        });
        
        // 重新渲染
        renderNotifications(notificationsData[notificationsData.currentTab]);
        
        // 更新未读数量
        await updateUnreadCounts();
        
        showToast('删除成功');
    } catch (error) {
        console.error('删除通知失败:', error);
        showToast('删除失败，请重试');
    }
}

/**
 * 加载更多通知
 */
async function loadMoreNotifications() {
    if (!notificationsData.hasMore || notificationsData.loading) return;
    
    notificationsData.currentPage++;
    await loadNotifications(notificationsData.currentTab, true);
}

/**
 * 显示通知设置
 */
function showNotificationSettings() {
    showToast('通知设置功能开发中');
}

// 工具函数
if (typeof showToast !== 'function') {
    window.showToast = function(message) {
        alert(message);
    };
}

console.log('✅ notifications.js 模块已加载');

