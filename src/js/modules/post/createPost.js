/**
 * 发帖模块 - 创建帖子功能
 * 处理帖子创建、画图、文字编辑、图片上传等
 */

import { getSupabaseClient } from '../../supabase.js';
import { appState } from '../../state.js';
import { switchPage } from '../../navigation.js';
import { showToast } from '../../utils.js';

// 画布相关变量
let postCanvas = null;
let postCtx = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = '#000';
let drawingHistory = [];
let historyStep = -1;
let hasDrawing = false;

/**
 * 初始化发帖页面
 */
export function initCreatePost() {
    console.log("📝 初始化发帖页面...");
    setupPostCanvas();
    setupPostForm();
}

/**
 * 设置发帖画布
 */
function setupPostCanvas() {
    postCanvas = document.getElementById('postCanvas');
    if (!postCanvas) return;
    
    postCtx = postCanvas.getContext('2d');
    
    // 设置画布背景为白色
    postCtx.fillStyle = '#ffffff';
    postCtx.fillRect(0, 0, postCanvas.width, postCanvas.height);
    
    // 保存初始状态
    saveCanvasState();
    
    // 设置画笔样式
    postCtx.strokeStyle = currentColor;
    postCtx.lineWidth = 3;
    postCtx.lineCap = 'round';
    postCtx.lineJoin = 'round';
    
    // 绑定事件
    postCanvas.addEventListener('mousedown', startDrawing);
    postCanvas.addEventListener('mousemove', draw);
    postCanvas.addEventListener('mouseup', stopDrawing);
    postCanvas.addEventListener('mouseout', stopDrawing);
    
    // 触摸事件（移动端）
    postCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    postCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    postCanvas.addEventListener('touchend', stopDrawing);
}

/**
 * 开始绘画
 */
function startDrawing(e) {
    isDrawing = true;
    const rect = postCanvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    
    // 隐藏占位符
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    
    hasDrawing = true;
}

/**
 * 绘画
 */
function draw(e) {
    if (!isDrawing) return;
    
    const rect = postCanvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    postCtx.beginPath();
    postCtx.moveTo(lastX, lastY);
    postCtx.lineTo(currentX, currentY);
    postCtx.stroke();
    
    lastX = currentX;
    lastY = currentY;
}

/**
 * 停止绘画
 */
function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveCanvasState();
    }
}

/**
 * 触摸开始
 */
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = postCanvas.getBoundingClientRect();
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
    isDrawing = true;
    
    // 隐藏占位符
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    
    hasDrawing = true;
}

/**
 * 触摸移动
 */
function handleTouchMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = postCanvas.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    
    postCtx.beginPath();
    postCtx.moveTo(lastX, lastY);
    postCtx.lineTo(currentX, currentY);
    postCtx.stroke();
    
    lastX = currentX;
    lastY = currentY;
}

/**
 * 保存画布状态
 */
function saveCanvasState() {
    historyStep++;
    if (historyStep < drawingHistory.length) {
        drawingHistory.length = historyStep;
    }
    drawingHistory.push(postCanvas.toDataURL());
}

/**
 * 撤销
 */
export function undoPostCanvas() {
    if (historyStep > 0) {
        historyStep--;
        const img = new Image();
        img.src = drawingHistory[historyStep];
        img.onload = () => {
            postCtx.clearRect(0, 0, postCanvas.width, postCanvas.height);
            postCtx.drawImage(img, 0, 0);
        };
    }
}

/**
 * 清空画布
 */
export function clearPostCanvas() {
    if (!confirm('确定要清空画布吗？')) return;
    
    postCtx.fillStyle = '#ffffff';
    postCtx.fillRect(0, 0, postCanvas.width, postCanvas.height);
    postCtx.fillStyle = currentColor;
    
    // 显示占位符
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) placeholder.style.display = 'flex';
    
    hasDrawing = false;
    saveCanvasState();
}

/**
 * 设置颜色
 */
export function setPostColor(color, element) {
    currentColor = color;
    postCtx.strokeStyle = color;
    
    // 更新选中状态
    document.querySelectorAll('#postColorPicker .color-dot').forEach(dot => {
        dot.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }
}

/**
 * 切换贴纸面板
 */
export function togglePostStickers() {
    const panel = document.getElementById('postStickerPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * 添加贴纸
 */
export function addPostSticker(emoji) {
    // 在画布中心添加贴纸
    postCtx.font = '48px Arial';
    postCtx.fillText(emoji, postCanvas.width / 2 - 24, postCanvas.height / 2 + 16);
    
    // 隐藏占位符
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    
    hasDrawing = true;
    saveCanvasState();
    
    // 隐藏贴纸面板
    togglePostStickers();
}

/**
 * 设置发帖表单
 */
function setupPostForm() {
    // 字数统计已在 HTML 中通过 oninput 实现
}

/**
 * 更新字数统计
 */
export function updatePostCharCount() {
    const textarea = document.getElementById('postTextarea');
    const countEl = document.getElementById('postCharCount');
    if (textarea && countEl) {
        countEl.textContent = textarea.value.length;
    }
}

/**
 * 发布帖子
 */
export async function publishPost() {
    const textContent = document.getElementById('postTextarea')?.value?.trim();
    
    // 检查是否有内容
    if (!hasDrawing && !textContent) {
        showToast("请画点什么或写点什么吧~", 'error');
        return;
    }
    
    // 检查登录状态
    if (!appState.user || appState.isGuest) {
        showToast("游客模式不能发帖，请先登录", 'error');
        setTimeout(() => {
            switchPage('login');
        }, 1500);
        return;
    }
    
    const client = getSupabaseClient();
    if (!client) {
        showToast("网络连接异常", 'error');
        return;
    }
    
    // 设置按钮加载状态
    const publishBtn = document.getElementById('publishBtn');
    const originalText = publishBtn?.textContent;
    if (publishBtn) {
        publishBtn.disabled = true;
        publishBtn.textContent = '发布中...';
    }
    
    try {
        console.log("📤 正在发布帖子...");
        
        // 上传画布图片（如果有绘画）
        let imageUrl = null;
        if (hasDrawing) {
            imageUrl = await uploadCanvasImage();
        }
        
        // 创建帖子
        const { data, error } = await client
            .from('posts')
            .insert({
                user_id: appState.user.id,
                user_name: appState.user.name || appState.user.email?.split('@')[0] || '用户',
                text_content: textContent || null,
                image_url: imageUrl,
                likes_count: 0,
                comments_count: 0,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) {
            console.error("❌ 发布失败:", error);
            showToast("发布失败: " + error.message, 'error');
            return;
        }
        
        console.log("✅ 发布成功:", data);
        showToast("发布成功！🎉", 'success');
        
        // 清空表单
        clearPostForm();
        
        // 延迟跳转到首页并刷新Feed
        setTimeout(() => {
            switchPage('swipe');
            // 刷新Feed以显示新帖子
            if (window.refreshSwipeFeed) {
                setTimeout(() => {
                    window.refreshSwipeFeed();
                }, 300);
            }
        }, 1000);
        
    } catch (err) {
        console.error("❌ 发布异常:", err);
        showToast("发布失败，请稍后重试", 'error');
    } finally {
        // 恢复按钮状态
        if (publishBtn) {
            publishBtn.disabled = false;
            publishBtn.textContent = originalText || '发布';
        }
    }
}

/**
 * 上传画布图片
 */
async function uploadCanvasImage() {
    const client = getSupabaseClient();
    if (!client) return null;
    
    try {
        // 将画布转换为 Blob
        const blob = await new Promise(resolve => {
            postCanvas.toBlob(resolve, 'image/png');
        });
        
        // 生成文件名
        const fileName = `${appState.user.id}-${Date.now()}.png`;
        const filePath = `posts/${fileName}`;
        
        // 上传到 Supabase Storage
        const { error: uploadError } = await client.storage
            .from('post-images')
            .upload(filePath, blob, {
                contentType: 'image/png',
                upsert: false
            });
        
        if (uploadError) {
            console.error("❌ 图片上传失败:", uploadError);
            throw uploadError;
        }
        
        // 获取公开 URL
        const { data } = client.storage
            .from('post-images')
            .getPublicUrl(filePath);
        
        console.log("✅ 图片上传成功:", data.publicUrl);
        return data.publicUrl;
        
    } catch (err) {
        console.error("❌ 图片上传异常:", err);
        throw err;
    }
}

/**
 * 清空发帖表单
 */
function clearPostForm() {
    // 清空文字
    const textarea = document.getElementById('postTextarea');
    if (textarea) {
        textarea.value = '';
        updatePostCharCount();
    }
    
    // 清空画布
    if (postCanvas && postCtx) {
        postCtx.fillStyle = '#ffffff';
        postCtx.fillRect(0, 0, postCanvas.width, postCanvas.height);
        postCtx.fillStyle = currentColor;
        
        // 显示占位符
        const placeholder = document.getElementById('canvasPlaceholder');
        if (placeholder) placeholder.style.display = 'flex';
        
        hasDrawing = false;
        drawingHistory = [];
        historyStep = -1;
        saveCanvasState();
    }
}

// 导出到 window
window.initCreatePost = initCreatePost;
window.publishPost = publishPost;
window.clearPostCanvas = clearPostCanvas;
window.undoPostCanvas = undoPostCanvas;
window.setPostColor = setPostColor;
window.togglePostStickers = togglePostStickers;
window.addPostSticker = addPostSticker;
window.updatePostCharCount = updatePostCharCount;

