/**
 * Supabase Client Management Module
 * Handle Supabase client initialization and loading
 */

import { SUPABASE_CONFIG } from './config.js';

let _supabaseClient = null;

/**
 * Initialize Supabase client
 */
export function initSupabase() {
    if (_supabaseClient) return _supabaseClient;
    
    try {
        if (typeof supabase !== 'undefined') {
            _supabaseClient = supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.key,
                {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true
                    }
                }
            );
            console.log("Supabase client initialized", {
                url: SUPABASE_CONFIG.url,
                keyPrefix: SUPABASE_CONFIG.key.substring(0, 20) + '...'
            });
            return _supabaseClient;
        } else {
            console.warn("supabase object undefined, script may not be loaded");
        }
    } catch (err) {
        console.error("Supabase initialization error:", err);
        console.error("Error details:", {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
    }
    return null;
}

/**
 * Dynamically load Supabase library and initialize
 */
export function loadSupabaseAndInit() {
    return new Promise((resolve) => {
        if (typeof supabase !== 'undefined') {
            _supabaseClient = initSupabase();
            resolve(_supabaseClient);
            return;
        }
        
        const script = document.createElement('script');
        script.src = `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@${SUPABASE_CONFIG.version}`;
        script.async = true;
        
        script.onload = () => {
            try {
                if (typeof supabase !== 'undefined') {
                    _supabaseClient = supabase.createClient(
                        SUPABASE_CONFIG.url,
                        SUPABASE_CONFIG.key,
                        {
                            auth: {
                                persistSession: true,
                                autoRefreshToken: true
                            }
                        }
                    );
                    console.log("Supabase loaded via CDN and initialized");
                } else {
                    console.error("Script loaded but supabase object still unavailable");
                }
            } catch (e) {
                console.error("Supabase initialization failed after dynamic load:", e);
                console.error("Error details:", {
                    message: e.message,
                    stack: e.stack,
                    name: e.name
                });
            }
            resolve(_supabaseClient);
        };
        
        script.onerror = (error) => {
            console.error("Cannot load Supabase script, check network or VPN");
            console.error("Script load error:", error);
            console.error("Attempted URL:", script.src);
            resolve(null);
        };
        
        document.head.appendChild(script);
    });
}

/**
 * Get Supabase client instance
 */
export function getSupabaseClient() {
    return _supabaseClient || initSupabase();
}

/**
 * Check and restore login session
 */
export async function checkAndRestoreSession() {
    const client = getSupabaseClient();
    if (!client) {
        console.log("Supabase not ready, skip session check");
        return null;
    }

    try {
        console.log("Checking login status...");
        const { data: { session }, error } = await client.auth.getSession();
        
        if (error) {
            console.warn("Get session failed:", error.message);
            return null;
        }

        return session;
    } catch (err) {
        console.error("Session check error:", err);
        return null;
    }
}
