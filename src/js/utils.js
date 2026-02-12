/**
 * Utility Functions Module
 * Contains various helper functions
 */

/**
 * Start login demo animation (optional)
 */
export function startLoginDemo() {
    const overlay = document.getElementById('demoOverlay');
    if (overlay) overlay.classList.add('show');

    const emojiEl = document.getElementById('demoEmoji');
    const textEl = document.getElementById('demoText');
    
    if (emojiEl) emojiEl.textContent = "💩";
    if (textEl) textEl.textContent = "Ready to de-stress?";
}

/**
 * Show Toast notification
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
