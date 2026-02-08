-- ============================================
-- 插入测试数据脚本（无需用户版本）
-- ⚠️ 注意：这个版本会先创建测试用户，然后插入数据
-- ============================================

-- 由于 Supabase 不允许直接插入 auth.users，我们需要：
-- 1. 先通过应用注册用户
-- 2. 或者使用 Supabase Dashboard 创建用户
-- 3. 然后执行 insert_test_data.sql

-- ============================================
-- 临时解决方案：检查是否有用户，如果没有则提示
-- ============================================

DO $$
DECLARE
    user_count INTEGER;
    user1_id UUID;
BEGIN
    -- 检查用户数量
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    IF user_count = 0 THEN
        RAISE EXCEPTION '没有找到用户！请先执行以下操作之一：
1. 在应用中注册账号（推荐）：
   - 打开应用
   - 点击"注册新账号"
   - 输入邮箱和密码完成注册

2. 在 Supabase Dashboard 中创建用户：
   - 进入 Supabase Dashboard
   - 点击左侧菜单 "Authentication"
   - 点击 "Users" 标签
   - 点击 "Add User" 或 "Invite User"
   - 填写邮箱和密码创建用户

创建用户后，重新执行 insert_test_data.sql 脚本';
    END IF;
    
    -- 获取第一个用户
    SELECT id INTO user1_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    RAISE NOTICE '找到 % 个用户，使用用户ID: %', user_count, user1_id;
    RAISE NOTICE '可以继续执行 insert_test_data.sql 脚本';
END $$;
