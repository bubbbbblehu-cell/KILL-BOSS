/**
 * 划一划发帖模块 - 主入口
 * 统一管理首页的初始化和事件
 */

import { initLeaderboard } from './leaderboard.js';
import { initSwipeFeed } from './swipeFeed.js';

/**
 * 初始化首页
 */
export async function initSwipePage() {
    console.log("📱 初始化首页...");
    
    // 初始化榜单
    await initLeaderboard();
    
    // 初始化滑动Feed
    await initSwipeFeed();
}

// 监听页面激活事件
window.addEventListener('swipePageActive', () => {
    initSwipePage();
});

// 页面加载时，如果当前是首页，则初始化
document.addEventListener('DOMContentLoaded', () => {
    const swipePage = document.getElementById('swipePage');
    if (swipePage && swipePage.classList.contains('active')) {
        initSwipePage();
    }
});
