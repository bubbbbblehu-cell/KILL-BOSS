/**
 * Swipe Feed Module - Main Entry
 * Manage homepage initialization and events
 */

import { initLeaderboard } from './leaderboard.js';
import { initSwipeFeed } from './swipeFeed.js';

/**
 * Initialize swipe page
 */
export async function initSwipePage() {
    console.log("Initialize swipe page...");
    
    await initLeaderboard();
    
    await initSwipeFeed();
}

window.addEventListener('swipePageActive', () => {
    initSwipePage();
});

document.addEventListener('DOMContentLoaded', () => {
    const swipePage = document.getElementById('swipePage');
    if (swipePage && swipePage.classList.contains('active')) {
        initSwipePage();
    }
});
