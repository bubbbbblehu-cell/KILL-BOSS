-- ============================================
-- 简化版：删除所有表脚本（最简单的方法）
-- ⚠️ 警告：此操作不可逆，会删除所有数据！
-- ============================================

-- 方法：直接使用 CASCADE 删除表，会自动删除所有依赖对象
-- 即使表不存在也不会报错（使用 IF EXISTS）

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS map_poops CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- 删除触发器函数（如果存在）
DROP FUNCTION IF EXISTS update_post_likes_count() CASCADE;
DROP FUNCTION IF EXISTS update_post_comments_count() CASCADE;

-- ============================================
-- 验证：检查是否还有表存在
-- ============================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
