# ⚡ 快速开始 - 插入测试数据

## 🎯 3步快速插入数据

### 第1步：打开 SQL Editor
1. 登录 https://supabase.com/dashboard
2. 选择项目 `rjqdxxwurocqsewvtduf`
3. 点击左侧菜单 **"SQL Editor"**

### 第2步：复制并粘贴脚本
1. 打开项目中的 `insert_test_data.sql` 文件
2. 全选并复制（Ctrl+A, Ctrl+C）
3. 粘贴到 SQL Editor 中（Ctrl+V）

### 第3步：执行
1. 点击右上角 **"Run"** 按钮
2. 等待执行完成
3. 看到 "✅ 测试数据插入完成！" 即成功

## ✅ 验证成功

执行这个查询检查：

```sql
SELECT COUNT(*) as posts FROM posts;
```

如果返回 `30`，说明数据插入成功！

## 🎉 完成

现在刷新应用页面，应该能看到：
- ✅ 30条有趣的帖子
- ✅ Top3 热门榜单
- ✅ 可以滑动浏览帖子

## ⚠️ 如果报错

**错误：没有找到用户**
→ 先在应用中注册一个账号，然后重新执行脚本

**错误：表不存在**
→ 先执行 `database_setup.sql` 创建表

## 📚 详细说明

查看 `HOW_TO_INSERT_DATA.md` 获取更详细的步骤说明。
