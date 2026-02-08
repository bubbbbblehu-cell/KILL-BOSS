/**
 * 发帖模块 - 文字编辑功能
 * 提供文字输入、格式化等功能
 */

/**
 * 初始化文字编辑器
 */
export function initTextEditor() {
    const textInput = document.getElementById('postTextInput');
    if (!textInput) return;

    // 字数统计
    setupCharCount(textInput);

    // 输入限制
    textInput.addEventListener('input', (e) => {
        const maxLength = 500; // 最大500字
        if (e.target.value.length > maxLength) {
            e.target.value = e.target.value.substring(0, maxLength);
            alert(`最多只能输入${maxLength}字`);
        }
        updateCharCount(e.target);
    });
}

/**
 * 设置字数统计
 */
function setupCharCount(input) {
    const container = input.closest('.post-form-container');
    if (!container) return;

    const counter = document.createElement('div');
    counter.className = 'char-count';
    counter.id = 'charCount';
    container.appendChild(counter);
    
    updateCharCount(input);
}

/**
 * 更新字数统计
 */
function updateCharCount(input) {
    const counter = document.getElementById('charCount');
    if (!counter) return;

    const length = input.value.length;
    const maxLength = 500;
    
    counter.textContent = `${length}/${maxLength}`;
    counter.style.color = length > maxLength * 0.9 ? '#ff4444' : '#666';
}

/**
 * 插入表情
 */
export function insertEmoji(emoji) {
    const textInput = document.getElementById('postTextInput');
    if (!textInput) return;

    const cursorPos = textInput.selectionStart;
    const textBefore = textInput.value.substring(0, cursorPos);
    const textAfter = textInput.value.substring(cursorPos);
    
    textInput.value = textBefore + emoji + textAfter;
    textInput.focus();
    textInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
    
    updateCharCount(textInput);
}

/**
 * 格式化文本（可选功能）
 */
export function formatText(command) {
    const textInput = document.getElementById('postTextInput');
    if (!textInput) return;

    const selectedText = textInput.value.substring(
        textInput.selectionStart,
        textInput.selectionEnd
    );

    if (!selectedText) return;

    let formattedText = '';
    switch (command) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        default:
            formattedText = selectedText;
    }

    const textBefore = textInput.value.substring(0, textInput.selectionStart);
    const textAfter = textInput.value.substring(textInput.selectionEnd);
    
    textInput.value = textBefore + formattedText + textAfter;
    textInput.focus();
}
