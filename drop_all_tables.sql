-- ============================================
-- 删除所有表脚本
-- ⚠️ 警告：此操作不可逆，会删除所有数据！
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 1. 删除触发器（如果表存在）
DO $$
BEGIN
    -- 删除 likes 表的触发器（如果表存在）
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes') THEN
        DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON likes;
    END IF;
    
    -- 删除 comments 表的触发器（如果表存在）
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON comments;
    END IF;
END $$;

-- 2. 删除触发器函数
DROP FUNCTION IF EXISTS update_post_likes_count() CASCADE;
DROP FUNCTION IF EXISTS update_post_comments_count() CASCADE;

-- 3. 删除所有 RLS 策略（安全删除，即使表不存在也不会报错）
DO $$
BEGIN
    -- notifications 表的策略
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
        DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
        DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
    END IF;

    -- map_poops 表的策略
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'map_poops') THEN
        DROP POLICY IF EXISTS "Anyone can read map poops" ON map_poops;
        DROP POLICY IF EXISTS "Authenticated users can insert map poops" ON map_poops;
    END IF;

    -- buildings 表的策略
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'buildings') THEN
        DROP POLICY IF EXISTS "Anyone can read buildings" ON buildings;
        DROP POLICY IF EXISTS "Authenticated users can insert buildings" ON buildings;
    END IF;

    -- favorites 表的策略
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites') THEN
        DROP POLICY IF EXISTS "Users can read own favorites" ON favorites;
        DROP POLICY IF EXISTS "Authenticated users can insert favorites" ON favorites;
        DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
    END IF;

    -- likes 表的策略
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes') THEN
        DROP POLICY IF EXISTS "Anyone can read likes" ON likes;
        DROP POLICY IF EXISTS "Authenticated users can insert likes" ON likes;
        DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
    END IF;

    -- comments 表的策略
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
        DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
        DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
    END IF;

    -- posts 表的策略
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        DROP POLICY IF EXISTS "Anyone can read posts" ON posts;
        DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;
        DROP POLICY IF EXISTS "Users can update own posts" ON posts;
        DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
    END IF;
END $$;

-- 4. 删除表（按依赖顺序，先删除有外键的表）

-- 删除 notifications（依赖 posts 和 users）
DROP TABLE IF EXISTS notifications CASCADE;

-- 删除 favorites（依赖 posts 和 users）
DROP TABLE IF EXISTS favorites CASCADE;

-- 删除 likes（依赖 posts 和 users）
DROP TABLE IF EXISTS likes CASCADE;

-- 删除 comments（依赖 posts 和 users）
DROP TABLE IF EXISTS comments CASCADE;

-- 删除 map_poops（依赖 users）
DROP TABLE IF EXISTS map_poops CASCADE;

-- 删除 buildings（依赖 users，但可为 NULL）
DROP TABLE IF EXISTS buildings CASCADE;

-- 删除 posts（依赖 users）
DROP TABLE IF EXISTS posts CASCADE;

-- ============================================
-- 删除完成
-- ============================================

-- 验证：检查是否还有表存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
