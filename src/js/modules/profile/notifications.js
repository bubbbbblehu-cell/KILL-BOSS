/**
 * 我的模块 - 消息通知功能
 * 显示和管理用户的通知消息
 */

import { getSupabaseClient } from '../../supabase.js';
import { appState } from '../../state.js';

/**
 * 初始化消息通知
 */
export async function initNotifications() {
    console.log("🔔 初始化消息通知...");
    
    if (!appState.user || appState.isGuest) {
        showLoginPrompt();
        return;
    }

    await loadNotifications();
    setupNotificationBadge();
}

/**
 * 加载通知列表
 */
async function loadNotifications() {
    const client = getSupabaseClient();
    const container = document.getElementById('notificationsContainer');
    
    if (!container) return;

    if (!client) {
        container.innerHTML = '<div class="no-notifications">网络连接异常</div>';
        return;
    }

    try {
        const { data, error } = await client
            .from('notifications')
            .select('*')
            .eq('user_id', appState.user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error("❌ 加载通知失败:", error);
            container.innerHTML = '<div class="error">加载失败</div>';
            return;
        }

        renderNotifications(container, data || []);
    } catch (err) {
        console.error("❌ 加载通知异常:", err);
        container.innerHTML = '<div class="error">加载失败</div>';
    }
}

/**
 * 渲染通知列表
 */
function renderNotifications(container, notifications) {
    if (notifications.length === 0) {
        container.innerHTML = '<div class="no-notifications">暂无通知</div>';
        return;
    }

    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.is_read ? 'read' : 'unread'}" 
             data-notification-id="${notif.id}">
            <div class="notification-icon">${getNotificationIcon(notif.type)}</div>
            <div class="notification-content">
                <div class="notification-text">${notif.content}</div>
                <div class="notification-time">${formatTime(notif.created_at)}</div>
            </div>
            ${!notif.is_read ? '<div class="notification-dot"></div>' : ''}
            <button onclick="markAsRead(${notif.id})" class="btn-mark-read">标记已读</button>
        </div>
    `).join('');

    // 添加点击事件
    container.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const notifId = item.dataset.notificationId;
            handleNotificationClick(notifId);
        });
    });
}

/**
 * 获取通知图标
 */
function getNotificationIcon(type) {
    const icons = {
        like: '👍',
        comment: '💬',
        follow: '👤',
        system: '🔔',
        default: '📢'
    };
    return icons[type] || icons.default;
}

/**
 * 处理通知点击
 */
async function handleNotificationClick(notifId) {
    await markAsRead(notifId);
    // TODO: 根据通知类型跳转到对应页面
}

/**
 * 标记为已读
 */
export async function markAsRead(notifId) {
    const client = getSupabaseClient();
    if (!client) return;

    try {
        const { error } = await client
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notifId)
            .eq('user_id', appState.user.id);

        if (error) {
            console.error("❌ 标记已读失败:", error);
            return;
        }

        // 更新UI
        const item = document.querySelector(`[data-notification-id="${notifId}"]`);
        if (item) {
            item.classList.remove('unread');
            item.classList.add('read');
            const dot = item.querySelector('.notification-dot');
            if (dot) dot.remove();
        }

        // 更新未读数量
        await updateUnreadCount();
    } catch (err) {
        console.error("❌ 标记已读异常:", err);
    }
}

/**
 * 标记全部已读
 */
export async function markAllAsRead() {
    const client = getSupabaseClient();
    if (!client) return;

    try {
        const { error } = await client
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', appState.user.id)
            .eq('is_read', false);

        if (error) {
            console.error("❌ 标记全部已读失败:", error);
            alert("操作失败");
            return;
        }

        // 重新加载列表
        await loadNotifications();
    } catch (err) {
        console.error("❌ 标记全部已读异常:", err);
        alert("操作失败");
    }
}

/**
 * 设置通知角标
 */
async function setupNotificationBadge() {
    const count = await getUnreadCount();
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = count > 0 ? count : '';
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

/**
 * 获取未读通知数量
 */
async function getUnreadCount() {
    const client = getSupabaseClient();
    if (!client) return 0;

    try {
        const { count, error } = await client
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', appState.user.id)
            .eq('is_read', false);

        if (error) {
            console.error("❌ 获取未读数量失败:", error);
            return 0;
        }

        return count || 0;
    } catch (err) {
        console.error("❌ 获取未读数量异常:", err);
        return 0;
    }
}

/**
 * 更新未读数量
 */
async function updateUnreadCount() {
    await setupNotificationBadge();
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
}

/**
 * 显示登录提示
 */
function showLoginPrompt() {
    const container = document.getElementById('notificationsContainer');
    if (container) {
        container.innerHTML = '<div class="login-prompt">请先登录查看消息通知</div>';
    }
}

// 导出到 window
window.markAsRead = markAsRead;
window.markAllAsRead = markAllAsRead;
window.showNotifications = initNotifications;
