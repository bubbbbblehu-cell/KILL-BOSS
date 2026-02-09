# 💩 BOSS KILL

一个释放压力、扔掉烦恼的社交应用。通过扔便便、发帖子、地图互动等方式，让打工人释放工作压力。

## 📋 项目简介

BOSS KILL 是一个基于 Web 的社交应用，主要功能包括：
- 📱 **划一划发帖**：滑动浏览帖子，点赞、评论互动
- ✍️ **发帖功能**：发布文字和图片内容
- 🗺️ **地图互动**：在地图上扔便便、占领建筑
- 👤 **个人中心**：管理帖子、收藏、消息通知

## 🏗️ 技术栈

- **前端**：原生 JavaScript (ES6 Modules)
- **后端数据库**：Supabase (PostgreSQL)
- **认证**：Supabase Auth
- **存储**：Supabase Storage
- **部署**：Vercel

## 📁 项目结构

```
KILL-BOSS/
├── index.html              # 主 HTML 文件
├── style.css              # 样式文件
├── main.js                # 旧入口文件（已废弃）
│
├── src/
│   ├── js/                # JavaScript 模块
│   │   ├── main.js        # 主入口文件（导入所有模块）
│   │   ├── app.js         # 应用初始化
│   │   ├── config.js     # 配置常量
│   │   ├── state.js       # 状态管理
│   │   ├── supabase.js    # Supabase 客户端管理
│   │   ├── auth.js        # 认证功能（登录/注册/登出）
│   │   ├── navigation.js  # 页面导航
│   │   ├── utils.js       # 工具函数
│   │   ├── diagnostics.js # 诊断工具
│   │   │
│   │   └── modules/       # 功能模块
│   │       ├── swipe/     # 划一划发帖模块（泡鼠）
│   │       │   ├── swipeFeed.js    # 滑动Feed功能
│   │       │   ├── comments.js     # 评论功能
│   │       │   └── leaderboard.js  # 榜单功能
│   │       │
│   │       ├── post/      # 发帖模块（泡鼠）
│   │       │   ├── createPost.js   # 创建帖子
│   │       │   └── textEditor.js   # 文字编辑
│   │       │
│   │       ├── map/       # 地图模块（拆鼠）
│   │       │   └── mapView.js      # 地图视图
│   │       │
│   │       └── profile/  # 我的模块（拆鼠）
│   │           ├── myPosts.js      # 我的帖子
│   │           ├── favorites.js    # 我的收藏
│   │           └── notifications.js # 消息通知
│   │
│   └── server.js          # 后端服务器（可选）
│
├── database_setup.sql     # 数据库创建脚本
├── .env                   # 环境变量配置
│
└── docs/                  # 文档目录
    ├── DATABASE_SCHEMA.md      # 数据库表结构设计
    ├── FEATURE_ROADMAP.md      # 功能开发路线图
    ├── MODULE_STRUCTURE.md     # 模块结构说明
    ├── SQL_SETUP_GUIDE.md      # SQL 设置指南
    ├── SUPABASE_CHECKLIST.md   # Supabase 配置检查清单
    ├── LOGIN_TEST_GUIDE.md     # 登录功能测试指南
    └── MIGRATION_GUIDE.md      # 代码迁移指南
```

## 🔐 登录方式

### Magic Link 登录（推荐）

1. 输入邮箱地址
2. 点击"发送登录链接"
3. 检查邮箱（包括垃圾邮件文件夹）
4. 点击邮件中的 **"Log In"** 链接
5. 自动登录并跳转到首页

**特点**：
- ✅ 无需密码，更安全
- ✅ 点击即登录，更便捷
- ✅ 自动创建用户（首次登录即注册）
- ✅ 链接有效期 1 小时

**注意**：
- 每小时每个邮箱最多发送 3-4 封邮件
- 邮件可能在垃圾邮件文件夹
- 如果收不到邮件，可以在 Supabase Dashboard 手动创建用户

### 游客模式

点击"以游客身份进入"即可立即体验所有功能（数据不会保存）

### 详细说明

- **[MAGIC_LINK_LOGIN.md](MAGIC_LINK_LOGIN.md)** - Magic Link 使用说明
- **[EMAIL_VERIFICATION_SETUP.md](EMAIL_VERIFICATION_SETUP.md)** - 邮件配置指南

## 🚀 快速开始

### 1. 环境要求

- Node.js 14+ （如果使用后端服务器）
- 现代浏览器（Chrome 61+, Firefox 60+, Safari 11+）
- Supabase 账号

### 2. 克隆项目

```bash
git clone <repository-url>
cd KILL-BOSS
```

### 3. 配置 Supabase（⚠️ 重要）

#### 快速配置（3分钟）

**详细步骤请查看：[QUICK_CONFIG_GUIDE.md](QUICK_CONFIG_GUIDE.md)**

1. **获取 API Key**
   - 访问 [Supabase Dashboard API 设置](https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/settings/api)
   - 复制 **"anon public"** key（以 `eyJ` 开头）

2. **更新配置文件**
   - 打开 `src/js/config.js`
   - 将 `SUPABASE_CONFIG.key` 替换为你复制的 key
   - 保存文件

3. **测试配置**
   - 刷新浏览器页面
   - 打开控制台（F12）查看是否有 ✅ 标记
   - 或运行 `checkSupabaseConfig()` 检查配置

#### 完整配置指南

- **邮箱验证码配置**: [EMAIL_VERIFICATION_SETUP.md](EMAIL_VERIFICATION_SETUP.md)
- **快速配置指南**: [QUICK_CONFIG_GUIDE.md](QUICK_CONFIG_GUIDE.md)
- **Supabase 检查清单**: [SUPABASE_CHECKLIST.md](SUPABASE_CHECKLIST.md)

### 4. 创建数据库表

1. 打开 Supabase SQL Editor
2. 复制 `database_setup.sql` 文件内容
3. 粘贴到 SQL Editor 并执行
4. 参考 `SQL_SETUP_GUIDE.md` 获取详细说明

### 5. 创建 Storage Bucket

1. 在 Supabase Dashboard 中进入 Storage
2. 创建新 Bucket：
   - 名称：`post-images`
   - 设置为 Public
   - 文件大小限制：5MB

### 6. 运行项目

#### 方式一：直接打开（推荐用于开发）

```bash
# 使用本地服务器（避免 CORS 问题）
python -m http.server 8000
# 或使用 VS Code 的 Live Server 扩展
```

然后访问 `http://localhost:8000`

#### 方式二：使用后端服务器

```bash
npm install
npm start
```

## 📦 核心模块说明

### 核心模块

- **config.js** - 应用配置（Supabase URL、API Key 等）
- **state.js** - 全局状态管理（用户信息、应用数据）
- **supabase.js** - Supabase 客户端初始化和会话管理
- **auth.js** - 用户认证（登录、注册、登出、游客模式）
- **navigation.js** - 页面切换和导航
- **app.js** - 应用启动和初始化流程

### 功能模块

#### 1. 划一划发帖模块（泡鼠）

- **swipeFeed.js** - 滑动浏览帖子，左右滑动表示喜欢/不喜欢
- **comments.js** - 评论功能，支持添加和查看评论
- **leaderboard.js** - 榜单功能（今日/周/月/年榜）

#### 2. 发帖模块（泡鼠）

- **createPost.js** - 创建帖子，支持文字和图片
- **textEditor.js** - 文字编辑器，字数统计

#### 3. 地图模块（拆鼠）

- **mapView.js** - 地图显示，便便和建筑标记

#### 4. 我的模块（拆鼠）

- **myPosts.js** - 我的帖子列表和管理
- **favorites.js** - 我的收藏列表和管理
- **notifications.js** - 消息通知列表和管理

## 🗄️ 数据库结构

项目使用 Supabase (PostgreSQL) 作为数据库，主要表包括：

- **posts** - 帖子表
- **comments** - 评论表
- **likes** - 点赞表
- **favorites** - 收藏表
- **notifications** - 通知表
- **map_poops** - 地图便便表
- **buildings** - 建筑表

详细表结构请参考 `DATABASE_SCHEMA.md`

## 🔧 开发指南

### 添加新功能模块

1. 在 `src/js/modules/` 下创建新模块目录
2. 创建模块文件，导出必要的函数
3. 在 `src/js/main.js` 中导入新模块
4. 如需 HTML 调用，将函数挂载到 `window` 对象

### 代码规范

- 使用 ES6 Modules (`import`/`export`)
- 函数命名使用驼峰命名法
- 文件命名使用小写字母和连字符
- 添加必要的注释和文档

### 调试工具

在浏览器控制台运行：

```javascript
// 检查 Supabase 配置
checkSupabaseConfig()

// 测试 Supabase 连接
testSupabaseConnection()

// 显示配置帮助
showConfigHelp()

// Supabase 连接诊断
diagnoseSupabase()

// 查看当前状态
console.log(appState)

// 查看 Supabase 会话
getSupabaseClient().auth.getSession()
```

## 📚 文档索引

### 核心文档
- **[项目结构](PROJECT_STRUCTURE.md)** - 详细的项目结构和模块说明
- **[功能路线图](FEATURE_ROADMAP.md)** - 四大功能模块的详细规划
- **[模块结构](MODULE_STRUCTURE.md)** - 详细的模块说明和依赖关系

### 数据库相关
- **[数据库设计](DATABASE_SCHEMA.md)** - 完整的数据库表结构
- **[SQL 设置指南](SQL_SETUP_GUIDE.md)** - 数据库创建步骤
- **[database_setup.sql](database_setup.sql)** - 可直接执行的 SQL 脚本

### 开发指南
- **[Supabase 检查清单](SUPABASE_CHECKLIST.md)** - 连接问题排查
- **[登录测试指南](LOGIN_TEST_GUIDE.md)** - 登录功能测试步骤
- **[迁移指南](MIGRATION_GUIDE.md)** - 代码模块化迁移说明

## 🐛 常见问题

### Q1: 邮箱登录相关

#### Q: 收到邮件但没有验证码，只有一个链接？
**说明**: 这是正常的！系统使用的是 **Magic Link（魔法链接）** 登录方式。

**使用方法**:
1. 打开邮件
2. 点击邮件中的 **"Log In"** 链接
3. 自动登录并跳转到应用

**详细说明**: 查看 [MAGIC_LINK_LOGIN.md](MAGIC_LINK_LOGIN.md)

#### Q: 提示 "Supabase 对象未定义"
**原因**: API Key 未配置或配置错误

**解决方案**:
1. 查看 [QUICK_CONFIG_GUIDE.md](QUICK_CONFIG_GUIDE.md) 配置 API Key
2. 在控制台运行 `checkSupabaseConfig()`
3. 确保 key 以 `eyJ` 开头

#### Q: 提示 "发送过于频繁"
**原因**: Supabase 限制每小时每个邮箱最多发送 3-4 封邮件

**解决方案**:
1. 等待 1 小时后重试
2. 使用不同的邮箱地址
3. 在 [Supabase Dashboard](https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/auth/users) 直接创建用户（推荐）
4. 配置自定义 SMTP 服务（详见 [EMAIL_VERIFICATION_SETUP.md](EMAIL_VERIFICATION_SETUP.md)）

#### Q: 收不到邮件
**原因**: 邮件被标记为垃圾邮件

**解决方案**:
1. 检查垃圾邮件文件夹
2. 等待 2-3 分钟（邮件可能延迟）
3. 使用 Gmail 等常见邮箱
4. 配置自定义 SMTP（详见 [EMAIL_VERIFICATION_SETUP.md](EMAIL_VERIFICATION_SETUP.md)）
5. 在 Dashboard 手动创建用户

#### Q: 点击链接后没有登录？
**原因**: 链接已过期或已被使用

**解决方案**:
1. 重新发送登录链接
2. 确保在 1 小时内点击
3. 检查浏览器是否阻止弹窗

### Q2: Supabase 连接失败

参考 `SUPABASE_CHECKLIST.md` 进行排查：
- 检查 API Key 是否正确
- 检查 URL 是否正确
- 检查网络连接
- 运行 `diagnoseSupabase()` 诊断

### Q3: 模块加载失败

- 确保使用开发服务器（不是直接打开文件）
- 检查浏览器控制台的错误信息
- 确认所有模块文件路径正确

### Q4: 数据库表创建失败

- 使用 `database_setup.sql` 文件（不要使用 Markdown 文件）
- 按照 `SQL_SETUP_GUIDE.md` 的步骤执行
- 检查表之间的依赖关系

## 🎯 功能状态

### ✅ 已完成

- [x] 用户认证（登录/注册/登出）
- [x] 模块化代码结构
- [x] 数据库表设计
- [x] Supabase 集成
- [x] 基础页面导航

### 🚧 开发中

- [ ] 划一划发帖功能完善
- [ ] 评论功能完善
- [ ] 榜单功能实现
- [ ] 发帖功能完善
- [ ] 地图功能完善
- [ ] 个人中心功能完善

### 📋 计划中

参考 `FEATURE_ROADMAP.md` 查看详细功能规划

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[添加你的许可证]

## 🙏 致谢

感谢所有贡献者和用户的支持！

---

**Happy Coding! 💩**
