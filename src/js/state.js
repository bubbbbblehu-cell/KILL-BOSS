/**
 * 应用状态管理模块
 * 管理全局应用状态
 */

import { APP_CONFIG } from './config.js';

// 全局应用状态
export const appState = {
    isLoggedIn: false,
    isGuest: false,
    user: null,
    points: APP_CONFIG.defaultPoints,
    poopCount: APP_CONFIG.defaultPoopCount,
    towerCount: APP_CONFIG.defaultTowerCount,
    buildingCount: APP_CONFIG.defaultBuildingCount,
    checkinDays: APP_CONFIG.defaultCheckinDays,
    works: APP_CONFIG.defaultWorks,
    likedContents: new Set(),
    favoritedContents: new Set()
};

/**
 * 更新用户信息
 */
export function updateUser(userData) {
    appState.user = userData;
    appState.isLoggedIn = true;
    appState.isGuest = false;
}

/**
 * 清除用户信息
 */
export function clearUser() {
    appState.user = null;
    appState.isLoggedIn = false;
    appState.isGuest = false;
}

/**
 * 设置游客模式
 */
export function setGuestMode() {
    appState.isLoggedIn = true;
    appState.isGuest = true;
    appState.user = { id: 'guest', name: '匿名用户' };
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
    return appState.user;
}

/**
 * 检查是否已登录
 */
export function isAuthenticated() {
    return appState.isLoggedIn && !appState.isGuest && appState.user !== null;
}
