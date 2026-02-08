/**
 * 工具函数模块
 * 包含各种辅助函数
 */

/**
 * 启动登录演示动画（可选）
 */
export function startLoginDemo() {
    const overlay = document.getElementById('demoOverlay');
    if (overlay) overlay.classList.add('show');

    const emojiEl = document.getElementById('demoEmoji');
    const textEl = document.getElementById('demoText');
    
    if (emojiEl) emojiEl.textContent = "💩";
    if (textEl) textEl.textContent = "准备好解压了吗？";
}

/**
 * 显示 Toast 提示
 */
export function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) {
        // 如果 toast 元素不存在，创建它
        const toastEl = document.createElement('div');
        toastEl.id = 'toast';
        toastEl.className = 'toast';
        document.body.appendChild(toastEl);
        return showToast(message, type, duration);
    }
    
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}
