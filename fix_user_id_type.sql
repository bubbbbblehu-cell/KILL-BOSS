-- ============================================
-- 修复 user_id 字段类型脚本
-- 如果表已存在但 user_id 字段类型不正确，运行此脚本
-- ============================================

-- 注意：此脚本会修改现有表结构，请先备份数据！

-- 1. 修复 posts 表的 user_id 类型
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE posts 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        RAISE NOTICE 'Fixed posts.user_id type';
    END IF;
END $$;

-- 2. 修复 comments 表的 user_id 类型
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE comments 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        RAISE NOTICE 'Fixed comments.user_id type';
    END IF;
END $$;

-- 3. 修复 likes 表的 user_id 类型
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'likes' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE likes 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        RAISE NOTICE 'Fixed likes.user_id type';
    END IF;
END $$;

-- 4. 修复 favorites 表的 user_id 类型
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'favorites' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE favorites 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        RAISE NOTICE 'Fixed favorites.user_id type';
    END IF;
END $$;

-- 5. 修复 notifications 表的 user_id 类型
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE notifications 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        RAISE NOTICE 'Fixed notifications.user_id type';
    END IF;
END $$;

-- 6. 修复 map_poops 表的 user_id 类型
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'map_poops' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE map_poops 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        RAISE NOTICE 'Fixed map_poops.user_id type';
    END IF;
END $$;

-- 7. 修复 buildings 表的 user_id 类型（可为 NULL）
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'buildings' 
        AND column_name = 'user_id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE buildings 
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
        RAISE NOTICE 'Fixed buildings.user_id type';
    END IF;
END $$;

-- ============================================
-- 修复完成
-- ============================================
