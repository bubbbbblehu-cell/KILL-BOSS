/**
 * Page Navigation Module
 * Handle page switching and navigation
 */

/**
 * Switch page
 */
export function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageName + 'Page');
    if (target) {
        target.classList.add('active');
        console.log("Switched to page:", pageName);
        
        // 如果切换到登录页面，恢复上次登录的邮箱
        if (pageName === 'login') {
            setTimeout(() => {
                if (window.restoreLastLoginEmail) {
                    window.restoreLastLoginEmail();
                }
            }, 100);
        }
        
        // 如果切换到发帖页面，初始化画布
        if (pageName === 'post') {
            setTimeout(() => {
                if (window.initCreatePost) {
                    window.initCreatePost();
                }
            }, 100);
        }
        
        // 如果切换到首页，刷新Feed
        if (pageName === 'swipe') {
            setTimeout(() => {
                if (window.initSwipeFeed) {
                    window.initSwipeFeed();
                }
            }, 100);
        }
        
        // 触发页面激活事件
        window.dispatchEvent(new CustomEvent(`${pageName}PageActive`));
    }
}

/**
 * 跳过演示动画
 */
export function skipDemo() {
    const overlay = document.getElementById('demoOverlay');
    if (overlay) overlay.classList.remove('show');
    switchPage('swipe');
}

// 导出到 window 对象，供 HTML 调用
window.switchPage = switchPage;
window.skipDemo = skipDemo;
