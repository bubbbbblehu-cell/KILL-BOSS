/**
 * 页面导航模块
 * 处理页面切换和导航相关功能
 */

/**
 * 切换页面
 */
export function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageName + 'Page');
    if (target) {
        target.classList.add('active');
        console.log("已切换到页面:", pageName);
        
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
