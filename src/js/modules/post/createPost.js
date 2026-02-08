/**
 * 发帖模块 - 创建帖子功能
 * 处理帖子创建、图片上传、文字编辑等
 */

import { getSupabaseClient } from '../../supabase.js';
import { appState } from '../../state.js';
import { switchPage } from '../../navigation.js';

/**
 * 初始化发帖页面
 */
export function initCreatePost() {
    console.log("📝 初始化发帖页面...");
    setupPostForm();
    setupImageUpload();
}

/**
 * 设置发帖表单
 */
function setupPostForm() {
    const form = document.getElementById('createPostForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitPost();
    });
}

/**
 * 设置图片上传
 */
function setupImageUpload() {
    const fileInput = document.getElementById('postImageInput');
    const preview = document.getElementById('imagePreview');
    
    if (!fileInput || !preview) return;

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            previewImage(file, preview);
        }
    });
}

/**
 * 预览图片
 */
function previewImage(file, previewElement) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewElement.src = e.target.result;
        previewElement.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

/**
 * 提交帖子
 */
export async function submitPost() {
    const textContent = document.getElementById('postTextInput')?.value?.trim();
    const imageFile = document.getElementById('postImageInput')?.files[0];

    if (!textContent && !imageFile) {
        alert("请输入文字或上传图片");
        return;
    }

    if (!appState.user || appState.isGuest) {
        alert("请先登录");
        switchPage('login');
        return;
    }

    const client = getSupabaseClient();
    if (!client) {
        alert("网络连接异常");
        return;
    }

    try {
        console.log("📤 正在发布帖子...");

        // 上传图片（如果有）
        let imageUrl = null;
        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
        }

        // 创建帖子
        const { data, error } = await client
            .from('posts')
            .insert({
                user_id: appState.user.id,
                text_content: textContent || null,
                image_url: imageUrl,
                likes_count: 0,
                comments_count: 0
            })
            .select()
            .single();

        if (error) {
            console.error("❌ 发布失败:", error);
            alert("发布失败: " + error.message);
            return;
        }

        console.log("✅ 发布成功:", data);
        alert("发布成功！");

        // 清空表单
        clearPostForm();

        // 返回首页
        switchPage('swipe');
    } catch (err) {
        console.error("❌ 发布异常:", err);
        alert("发布失败，请稍后重试");
    }
}

/**
 * 上传图片
 */
async function uploadImage(file) {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${appState.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await client.storage
            .from('post-images')
            .upload(filePath, file);

        if (uploadError) {
            console.error("❌ 图片上传失败:", uploadError);
            throw uploadError;
        }

        // 获取公开 URL
        const { data } = client.storage
            .from('post-images')
            .getPublicUrl(filePath);

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
    const textInput = document.getElementById('postTextInput');
    const imageInput = document.getElementById('postImageInput');
    const preview = document.getElementById('imagePreview');

    if (textInput) textInput.value = '';
    if (imageInput) imageInput.value = '';
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
}

// 导出到 window
window.submitPost = submitPost;
