/**
 * 主入口文件
 * 导入所有模块并初始化应用
 */

// 导入核心模块
import './config.js';
import './state.js';
import './supabase.js';
import './auth.js';
import './navigation.js';
import './utils.js';
import './diagnostics.js';
import './configChecker.js';
import './app.js';

// 导入功能模块
// 划一划发帖模块
import './modules/swipe/index.js';
import './modules/swipe/swipeFeed.js';
import './modules/swipe/comments.js';
import './modules/swipe/leaderboard.js';

// 发帖模块
import './modules/post/createPost.js';
import './modules/post/textEditor.js';

// 地图模块
import './modules/map/mapView.js';

// 我的模块
import './modules/profile/myPosts.js';
import './modules/profile/favorites.js';
import './modules/profile/notifications.js';

// 所有模块已通过各自的文件导入和初始化
// app.js 会在 DOMContentLoaded 时自动初始化应用
