/**
 * Profile Module - My Posts Feature
 * Display and manage user posts
 */

import { getSupabaseClient } from '../../supabase.js';
import { appState } from '../../state.js';

/**
 * Initialize my posts page
 */
export async function initMyPosts() {
    console.log("Initialize my posts...");
    
    if (!appState.user || appState.isGuest) {
        showLoginPrompt();
        return;
    }

    await loadMyPosts();
}

/**
 * Load my posts
 */
async function loadMyPosts() {
    const client = getSupabaseClient();
    const container = document.getElementById('myPostsContainer');
    
    if (!container) return;

    if (!client) {
        container.innerHTML = '<div class="no-posts">Network error</div>';
        return;
    }

    try {
        const { data, error } = await client
            .from('posts')
            .select('*')
            .eq('user_id', appState.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Load my posts failed:", error);
            container.innerHTML = '<div class="error">Load failed</div>';
            return;
        }

        renderMyPosts(container, data || []);
    } catch (err) {
        console.error("Load my posts error:", err);
        container.innerHTML = '<div class="error">Load failed</div>';
    }
}

/**
 * Render my posts list
 */
function renderMyPosts(container, posts) {
    if (posts.length === 0) {
        container.innerHTML = '<div class="no-posts">No posts yet, go create one~</div>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="my-post-item" data-post-id="${post.id}">
            <div class="post-preview">
                ${post.image_url ? `<img src="${post.image_url}" alt="Post image">` : ''}
                ${post.text_content ? `<p>${post.text_content.substring(0, 50)}${post.text_content.length > 50 ? '...' : ''}</p>` : ''}
            </div>
            <div class="post-stats">
                <span>👍 ${post.likes_count || 0}</span>
                <span>💬 ${post.comments_count || 0}</span>
                <span>📅 ${formatDate(post.created_at)}</span>
            </div>
            <div class="post-actions">
                <button onclick="editPost(${post.id})" class="btn-edit">Edit</button>
                <button onclick="deletePost(${post.id})" class="btn-delete">Delete</button>
            </div>
        </div>
    `).join('');
}

/**
 * Delete post
 */
export async function deletePost(postId) {
    if (!confirm("Delete this post?")) {
        return;
    }

    const client = getSupabaseClient();
    if (!client) {
        alert("Network error");
        return;
    }

    try {
        const { error } = await client
            .from('posts')
            .delete()
            .eq('id', postId)
            .eq('user_id', appState.user.id);

        if (error) {
            console.error("Delete failed:", error);
            alert("Delete failed: " + error.message);
            return;
        }

        console.log("Delete success");
        
        await loadMyPosts();
    } catch (err) {
        console.error("Delete error:", err);
        alert("Delete failed, please try again");
    }
}

/**
 * Edit post
 */
export function editPost(postId) {
    console.log("Edit post:", postId);
    alert("Edit feature coming soon...");
}

/**
 * Show login prompt
 */
function showLoginPrompt() {
    const container = document.getElementById('myPostsContainer');
    if (container) {
        container.innerHTML = '<div class="login-prompt">Please login to view your posts</div>';
    }
}

/**
 * Format date
 */
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()}`;
}

/**
 * Show my works
 */
export async function showMyWorks() {
    console.log("View my works...");
    
    if (!appState.user || appState.isGuest) {
        alert("Guest mode cannot view works, please login");
        return;
    }

    const client = getSupabaseClient();
    if (!client) {
        alert("Network error");
        return;
    }

    try {
        const { data, error } = await client
            .from('posts')
            .select('*')
            .eq('user_id', appState.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Load my works failed:", error);
            alert("Load failed: " + error.message);
            return;
        }

        const worksCount = document.getElementById('userWorks');
        if (worksCount) {
            worksCount.textContent = data?.length || 0;
        }

        showWorksModal(data || []);
        
    } catch (err) {
        console.error("Load my works error:", err);
        alert("Load failed, please try again");
    }
}

/**
 * Show works modal
 */
function showWorksModal(posts) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="font-size: 18px; font-weight: 700;">My Works (${posts.length})</h3>
                <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-secondary);">×</button>
            </div>
            <div class="works-grid">
                ${posts.length === 0 ? '<div class="no-posts">No works yet, go create one~</div>' : 
                  posts.map(post => `
                    <div class="work-item">
                        ${post.image_url ? `<img src="${post.image_url}" alt="Work" style="width: 100%; border-radius: 12px; margin-bottom: 8px;">` : ''}
                        ${post.text_content ? `<p style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${post.text_content.substring(0, 50)}${post.text_content.length > 50 ? '...' : ''}</p>` : ''}
                        <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
                            <span>👍 ${post.likes_count || 0}</span>
                            <span>💬 ${post.comments_count || 0}</span>
                        </div>
                    </div>
                  `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

window.deletePost = deletePost;
window.editPost = editPost;
window.showMyWorks = showMyWorks;
