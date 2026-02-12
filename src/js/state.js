/**
 * Application State Management Module
 * Manage global application state
 */

import { APP_CONFIG } from './config.js';

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
 * Update user info
 */
export function updateUser(userData) {
    appState.user = userData;
    appState.isLoggedIn = true;
    appState.isGuest = false;
}

/**
 * Clear user info
 */
export function clearUser() {
    appState.user = null;
    appState.isLoggedIn = false;
    appState.isGuest = false;
}

/**
 * Set guest mode
 */
export function setGuestMode() {
    appState.isLoggedIn = true;
    appState.isGuest = true;
    appState.user = { id: 'guest', name: 'Anonymous' };
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
