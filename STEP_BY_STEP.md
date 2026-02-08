# 📋 插入测试数据 - 完整步骤

## ⚠️ 当前问题
执行 `insert_test_data.sql` 时报错：**"没有找到用户！"**

## ✅ 解决方案（2步）

### 第1步：创建用户账号（必须）

#### 方法A：在应用中注册（最简单）⭐

1. **打开应用**
   - 访问你的应用地址
   - 或直接打开 `index.html` 文件

2. **注册账号**
   ```
   邮箱：test1@bosskill.com
   密码：123456
   ```
   - 点击"注册新账号"按钮
   - 输入邮箱和密码
   - 点击注册

3. **如果提示需要邮箱验证**
   - 检查邮箱收件箱
   - 或暂时禁用邮箱验证（开发环境）

#### 方法B：在 Supabase Dashboard 中创建

1. **打开 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 登录并选择项目

2. **创建用户**
   - 点击左侧菜单 **"Authentication"**
   - 点击 **"Users"** 标签
   - 点击右上角 **"Add User"**
   - 填写：
     - Email: `test1@bosskill.com`
     - Password: `123456`
     - ✅ 勾选 **"Auto Confirm User"**
   - 点击 **"Create User"**

### 第2步：验证用户已创建

在 Supabase SQL Editor 中执行：

```sql
SELECT id, email FROM auth.users;
```

**如果能看到用户记录，说明创建成功！**

### 第3步：重新执行数据脚本

1. **打开 SQL Editor**
   - 在 Supabase Dashboard 中
   - 点击左侧菜单 **"SQL Editor"**

2. **执行脚本**
   - 打开 `insert_test_data.sql` 文件
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 **"Run"** 执行

3. **查看结果**
   - 应该看到："✅ 测试数据插入完成！"
   - 不再报错

## 🎯 快速检查清单

- [ ] 已创建至少1个用户账号
- [ ] 执行 `SELECT id, email FROM auth.users;` 能看到用户
- [ ] 重新执行 `insert_test_data.sql`
- [ ] 看到成功消息，没有报错

## 💡 建议

创建 **2-3个测试账号**，数据会更丰富：

1. `test1@bosskill.com` / `123456`
2. `test2@bosskill.com` / `123456`
3. `test3@bosskill.com` / `123456`

## 🆘 如果还是报错

1. **确认用户真的创建了**
   ```sql
   SELECT COUNT(*) FROM auth.users;
   ```
   应该返回 >= 1

2. **检查是否在正确的项目**
   - 确认项目ID：`rjqdxxwurocqsewvtduf`

3. **检查表是否存在**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'posts';
   ```
   应该返回 `posts`

## ✅ 成功后的验证

执行以下查询验证数据：

```sql
-- 查看帖子数量（应该返回 30）
SELECT COUNT(*) FROM posts;

-- 查看前5个帖子
SELECT text_content, likes_count, comments_count 
FROM posts 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🎉 完成

数据插入成功后：
- ✅ 应用首页会显示30条帖子
- ✅ 榜单会显示Top3热门作品
- ✅ 可以测试滑动、点赞等功能
