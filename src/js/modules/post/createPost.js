/**
 * Post Module - Create Post Feature
 * Handle post creation, drawing, text editing, image upload
 */

import { getSupabaseClient } from '../../supabase.js';
import { appState } from '../../state.js';
import { switchPage } from '../../navigation.js';
import { showToast } from '../../utils.js';

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
 * Initialize create post page
 */
export function initCreatePost() {
    console.log("Initialize create post page...");
    setupPostCanvas();
    setupPostForm();
}

/**
 * Setup post canvas
 */
function setupPostCanvas() {
    postCanvas = document.getElementById('postCanvas');
    if (!postCanvas) return;
    
    postCtx = postCanvas.getContext('2d');
    
    postCtx.fillStyle = '#ffffff';
    postCtx.fillRect(0, 0, postCanvas.width, postCanvas.height);
    
    saveCanvasState();
    
    postCtx.strokeStyle = currentColor;
    postCtx.lineWidth = 3;
    postCtx.lineCap = 'round';
    postCtx.lineJoin = 'round';
    
    postCanvas.addEventListener('mousedown', startDrawing);
    postCanvas.addEventListener('mousemove', draw);
    postCanvas.addEventListener('mouseup', stopDrawing);
    postCanvas.addEventListener('mouseout', stopDrawing);
    
    postCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    postCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    postCanvas.addEventListener('touchend', stopDrawing);
}

/**
 * Start drawing
 */
function startDrawing(e) {
    isDrawing = true;
    const rect = postCanvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    
    hasDrawing = true;
}

/**
 * Draw
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
 * Stop drawing
 */
function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveCanvasState();
    }
}

/**
 * Handle touch start
 */
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = postCanvas.getBoundingClientRect();
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
    isDrawing = true;
    
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    
    hasDrawing = true;
}

/**
 * Handle touch move
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
 * Save canvas state
 */
function saveCanvasState() {
    historyStep++;
    if (historyStep < drawingHistory.length) {
        drawingHistory.length = historyStep;
    }
    drawingHistory.push(postCanvas.toDataURL());
}

/**
 * Undo
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
 * Clear canvas
 */
export function clearPostCanvas() {
    if (!confirm('Clear canvas?')) return;
    
    postCtx.fillStyle = '#ffffff';
    postCtx.fillRect(0, 0, postCanvas.width, postCanvas.height);
    postCtx.fillStyle = currentColor;
    
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) placeholder.style.display = 'flex';
    
    hasDrawing = false;
    saveCanvasState();
}

/**
 * Set color
 */
export function setPostColor(color, element) {
    currentColor = color;
    postCtx.strokeStyle = color;
    
    document.querySelectorAll('#postColorPicker .color-dot').forEach(dot => {
        dot.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }
}

/**
 * Toggle sticker panel
 */
export function togglePostStickers() {
    const panel = document.getElementById('postStickerPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Add sticker
 */
export function addPostSticker(emoji) {
    postCtx.font = '48px Arial';
    postCtx.fillText(emoji, postCanvas.width / 2 - 24, postCanvas.height / 2 + 16);
    
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    
    hasDrawing = true;
    saveCanvasState();
    
    togglePostStickers();
}

/**
 * Setup post form
 */
function setupPostForm() {
}

/**
 * Update character count
 */
export function updatePostCharCount() {
    const textarea = document.getElementById('postTextarea');
    const countEl = document.getElementById('postCharCount');
    if (textarea && countEl) {
        countEl.textContent = textarea.value.length;
    }
}

/**
 * Publish post
 */
export async function publishPost() {
    const textContent = document.getElementById('postTextarea')?.value?.trim();
    
    if (!hasDrawing && !textContent) {
        showToast("Please draw or write something", 'error');
        return;
    }
    
    if (!appState.user || appState.isGuest) {
        showToast("Guest mode cannot post, please login", 'error');
        setTimeout(() => {
            switchPage('login');
        }, 1500);
        return;
    }
    
    const client = getSupabaseClient();
    if (!client) {
        showToast("Network error", 'error');
        return;
    }
    
    const publishBtn = document.getElementById('publishBtn');
    const originalText = publishBtn?.textContent;
    if (publishBtn) {
        publishBtn.disabled = true;
        publishBtn.textContent = 'Publishing...';
    }
    
    try {
        console.log("Publishing post...");
        
        let imageUrl = null;
        if (hasDrawing) {
            imageUrl = await uploadCanvasImage();
        }
        
        const { data, error } = await client
            .from('posts')
            .insert({
                user_id: appState.user.id,
                user_name: appState.user.name || appState.user.email?.split('@')[0] || 'User',
                text_content: textContent || null,
                image_url: imageUrl,
                likes_count: 0,
                comments_count: 0,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) {
            console.error("Publish failed:", error);
            showToast("Publish failed: " + error.message, 'error');
            return;
        }
        
        console.log("Publish success:", data);
        showToast("Published successfully!", 'success');
        
        clearPostForm();
        
        setTimeout(() => {
            switchPage('swipe');
            if (window.refreshSwipeFeed) {
                setTimeout(() => {
                    window.refreshSwipeFeed();
                }, 300);
            }
        }, 1000);
        
    } catch (err) {
        console.error("Publish error:", err);
        showToast("Publish failed, please try again", 'error');
    } finally {
        if (publishBtn) {
            publishBtn.disabled = false;
            publishBtn.textContent = originalText || 'Publish';
        }
    }
}

/**
 * Upload canvas image
 */
async function uploadCanvasImage() {
    const client = getSupabaseClient();
    if (!client) return null;
    
    try {
        const blob = await new Promise(resolve => {
            postCanvas.toBlob(resolve, 'image/png');
        });
        
        const fileName = `${appState.user.id}-${Date.now()}.png`;
        const filePath = `posts/${fileName}`;
        
        const { error: uploadError } = await client.storage
            .from('post-images')
            .upload(filePath, blob, {
                contentType: 'image/png',
                upsert: false
            });
        
        if (uploadError) {
            console.error("Image upload failed:", uploadError);
            throw uploadError;
        }
        
        const { data } = client.storage
            .from('post-images')
            .getPublicUrl(filePath);
        
        console.log("Image upload success:", data.publicUrl);
        return data.publicUrl;
        
    } catch (err) {
        console.error("Image upload error:", err);
        throw err;
    }
}

/**
 * Clear post form
 */
function clearPostForm() {
    const textarea = document.getElementById('postTextarea');
    if (textarea) {
        textarea.value = '';
        updatePostCharCount();
    }
    
    if (postCanvas && postCtx) {
        postCtx.fillStyle = '#ffffff';
        postCtx.fillRect(0, 0, postCanvas.width, postCanvas.height);
        postCtx.fillStyle = currentColor;
        
        const placeholder = document.getElementById('canvasPlaceholder');
        if (placeholder) placeholder.style.display = 'flex';
        
        hasDrawing = false;
        drawingHistory = [];
        historyStep = -1;
        saveCanvasState();
    }
}

window.initCreatePost = initCreatePost;
window.publishPost = publishPost;
window.clearPostCanvas = clearPostCanvas;
window.undoPostCanvas = undoPostCanvas;
window.setPostColor = setPostColor;
window.togglePostStickers = togglePostStickers;
window.addPostSticker = addPostSticker;
window.updatePostCharCount = updatePostCharCount;
