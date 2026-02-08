/**
 * 工具函数模块
 * 包含各种辅助函数
 */

/**
 * 启动登录演示动画
 */
export function startLoginDemo() {
    const overlay = document.getElementById('demoOverlay');
    if (overlay) overlay.classList.add('show');

    const emojiEl = document.getElementById('demoEmoji');
    const textEl = document.getElementById('demoText');
    
    if (emojiEl) emojiEl.textContent = "💩";
    if (textEl) textEl.textContent = "准备好解压了吗？";
}
