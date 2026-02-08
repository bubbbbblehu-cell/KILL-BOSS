-- ============================================
-- 插入测试数据脚本
-- ⚠️ 注意：需要先创建一些测试用户账号
-- 在 Supabase Dashboard → Authentication → Users 中创建测试用户
-- ============================================

-- 首先，我们需要获取一些用户ID
-- 请先创建至少3个测试用户，然后替换下面的 UUID

-- 方法1：使用当前登录的用户ID（推荐）
-- 在 Supabase SQL Editor 中运行以下查询获取用户ID：
-- SELECT id, email FROM auth.users LIMIT 5;

-- 方法2：手动替换下面的 UUID（从 Supabase Dashboard → Authentication → Users 复制）

-- ============================================
-- 步骤1：获取用户ID（请先执行此查询，然后复制用户ID）
-- ============================================
-- SELECT id, email FROM auth.users LIMIT 5;

-- ============================================
-- 步骤2：替换下面的占位符 UUID
-- ============================================

-- 假设有3个测试用户（请替换为实际的用户ID）
-- 如果只有1个用户，可以重复使用同一个ID

-- 临时变量（PostgreSQL 不支持，所以我们需要使用 DO 块）
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
BEGIN
    -- 获取用户ID（自动处理用户数量不足的情况）
    SELECT id INTO user1_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    -- 检查是否有用户
    IF user1_id IS NULL THEN
        RAISE EXCEPTION '没有找到用户！请先在应用中注册至少一个账号，或在 Supabase Dashboard → Authentication → Users 中创建用户';
    END IF;
    
    -- 尝试获取第二个用户
    SELECT id INTO user2_id FROM auth.users ORDER BY created_at OFFSET 1 LIMIT 1;
    IF user2_id IS NULL THEN
        user2_id := user1_id; -- 如果没有第二个用户，使用第一个
    END IF;
    
    -- 尝试获取第三个用户
    SELECT id INTO user3_id FROM auth.users ORDER BY created_at OFFSET 2 LIMIT 1;
    IF user3_id IS NULL THEN
        user3_id := user1_id; -- 如果没有第三个用户，使用第一个
    END IF;
    
    RAISE NOTICE '使用用户ID: % (用户1), % (用户2), % (用户3)', user1_id, user2_id, user3_id;

    -- ============================================
    -- 插入帖子数据
    -- ============================================
    
    INSERT INTO posts (user_id, text_content, likes_count, comments_count, created_at) VALUES
    (user1_id, '今天老板又让我加班到12点...💩 我要在地图上扔便便！', 156, 23, NOW() - INTERVAL '2 hours'),
    (user2_id, '996算什么，我已经连续工作15天了，感觉要升天了🚀', 234, 45, NOW() - INTERVAL '5 hours'),
    (user3_id, '老板说"年轻人要多吃苦"，我：好的，我这就去吃💩', 89, 12, NOW() - INTERVAL '1 day'),
    (user1_id, '今天又是想辞职的一天，但想想房贷...算了，继续搬砖🧱', 312, 67, NOW() - INTERVAL '1 day' + INTERVAL '3 hours'),
    (user2_id, '同事问我为什么这么晚还在公司，我说：因为老板说"早下班是不负责任的表现"😤', 178, 34, NOW() - INTERVAL '2 days'),
    (user3_id, '老板：这个项目很重要，周末加个班吧。我：好的（内心：💩💩💩）', 267, 56, NOW() - INTERVAL '2 days' + INTERVAL '6 hours'),
    (user1_id, '今天在地图上扔了10坨便便，感觉心情好多了！大家也来试试吧🗺️', 445, 89, NOW() - INTERVAL '3 days'),
    (user2_id, '老板说"工作要有激情"，我：好的，我现在对扔便便很有激情💩', 123, 28, NOW() - INTERVAL '3 days' + INTERVAL '4 hours'),
    (user3_id, '连续打卡7天了！虽然工作很累，但扔便便让我找到了生活的乐趣🎯', 189, 41, NOW() - INTERVAL '4 days'),
    (user1_id, '今天画了一个老板的画像，画完就扔到地图上了，解压神器！🎨', 298, 72, NOW() - INTERVAL '4 days' + INTERVAL '8 hours'),
    (user2_id, '老板：你为什么总是迟到？我：因为我在路上扔便便（开玩笑的😅）', 156, 33, NOW() - INTERVAL '5 days'),
    (user3_id, '工作压力大？来BOSS KILL扔便便吧！真的有用💪', 378, 94, NOW() - INTERVAL '5 days' + INTERVAL '2 hours'),
    (user1_id, '今天又占领了一座建筑！感觉自己是这个城市的主人了🏢', 223, 51, NOW() - INTERVAL '6 days'),
    (user2_id, '老板说"年轻人要有梦想"，我的梦想就是在地图上扔满便便💩', 145, 29, NOW() - INTERVAL '6 days' + INTERVAL '5 hours'),
    (user3_id, '连续工作一个月了，感觉要疯了...还好有这个解压神器😭', 412, 87, NOW() - INTERVAL '7 days'),
    (user1_id, '今天画了10个老板的画像，全部扔到地图上了！爽！🎨💩', 289, 63, NOW() - INTERVAL '7 days' + INTERVAL '3 hours'),
    (user2_id, '996算什么，我已经007了（0点上班0点下班一周7天）💀', 334, 78, NOW() - INTERVAL '8 days'),
    (user3_id, '老板说"工作要有成就感"，我：扔便便确实很有成就感👍', 201, 47, NOW() - INTERVAL '8 days' + INTERVAL '7 hours'),
    (user1_id, '今天在地图上建了一座"便便塔"，感觉自己是建筑师了🏗️', 167, 35, NOW() - INTERVAL '9 days'),
    (user2_id, '工作再累，也要保持微笑...然后在地图上扔便便😊💩', 256, 59, NOW() - INTERVAL '9 days' + INTERVAL '4 hours'),
    (user3_id, '老板说"年轻人要多吃苦"，我：好的，我这就去吃💩（真的吃了）', 189, 42, NOW() - INTERVAL '10 days'),
    (user1_id, '连续打卡30天了！虽然工作很累，但扔便便让我找到了生活的意义🌟', 445, 98, NOW() - INTERVAL '10 days' + INTERVAL '6 hours'),
    (user2_id, '今天又加班到凌晨，但在地图上扔便便让我心情好多了🌙', 178, 38, NOW() - INTERVAL '11 days'),
    (user3_id, '老板说"工作要有激情"，我：好的，我现在对扔便便很有激情💩🔥', 312, 71, NOW() - INTERVAL '11 days' + INTERVAL '2 hours'),
    (user1_id, '今天画了20个老板的画像，全部扔到地图上了！感觉自己是艺术家了🎨', 267, 64, NOW() - INTERVAL '12 days'),
    (user2_id, '工作压力大？来BOSS KILL扔便便吧！真的有用，我已经扔了1000坨了💪', 389, 85, NOW() - INTERVAL '12 days' + INTERVAL '8 hours'),
    (user3_id, '今天又占领了一座建筑！感觉自己是这个城市的主人了🏢👑', 223, 52, NOW() - INTERVAL '13 days'),
    (user1_id, '老板说"年轻人要有梦想"，我的梦想就是在地图上扔满便便💩✨', 145, 31, NOW() - INTERVAL '13 days' + INTERVAL '5 hours'),
    (user2_id, '连续工作两个月了，感觉要疯了...还好有这个解压神器😭💩', 412, 91, NOW() - INTERVAL '14 days'),
    (user3_id, '今天在地图上建了一座"便便塔"，感觉自己是建筑师了🏗️💩', 167, 37, NOW() - INTERVAL '14 days' + INTERVAL '3 hours');

    -- ============================================
    -- 插入点赞数据（为部分帖子添加点赞）
    -- ============================================
    
    -- 为前10个帖子添加一些点赞
    INSERT INTO likes (post_id, user_id, created_at)
    SELECT p.id, 
           CASE (ROW_NUMBER() OVER ()) % 3 + 1
               WHEN 1 THEN user1_id
               WHEN 2 THEN user2_id
               ELSE user3_id
           END,
           p.created_at + (RANDOM() * INTERVAL '1 hour')
    FROM posts p
    WHERE p.id IN (SELECT id FROM posts ORDER BY created_at DESC LIMIT 10)
    ON CONFLICT (post_id, user_id) DO NOTHING;

    -- ============================================
    -- 插入评论数据
    -- ============================================
    
    INSERT INTO comments (post_id, user_id, content, created_at)
    SELECT p.id,
           CASE (ROW_NUMBER() OVER ()) % 3 + 1
               WHEN 1 THEN user1_id
               WHEN 2 THEN user2_id
               ELSE user3_id
           END,
           CASE (ROW_NUMBER() OVER ()) % 10 + 1
               WHEN 1 THEN '哈哈哈，我也要扔便便！'
               WHEN 2 THEN '太真实了，打工人太难了😭'
               WHEN 3 THEN '老板看了会怎么想？😂'
               WHEN 4 THEN '我也在地图上扔了，真的解压！'
               WHEN 5 THEN '这个功能太有意思了💩'
               WHEN 6 THEN '打工人打工魂，打工都是人上人！'
               WHEN 7 THEN '我也要画老板的画像！'
               WHEN 8 THEN '连续打卡中，一起加油！'
               WHEN 9 THEN '这个解压方式太棒了👍'
               ELSE '我也要试试！'
           END,
           p.created_at + (RANDOM() * INTERVAL '2 hours')
    FROM posts p
    WHERE p.id IN (SELECT id FROM posts ORDER BY created_at DESC LIMIT 15)
    LIMIT 50;

    -- ============================================
    -- 插入收藏数据
    -- ============================================
    
    INSERT INTO favorites (post_id, user_id, created_at)
    SELECT p.id,
           CASE (ROW_NUMBER() OVER ()) % 3 + 1
               WHEN 1 THEN user1_id
               WHEN 2 THEN user2_id
               ELSE user3_id
           END,
           p.created_at + (RANDOM() * INTERVAL '30 minutes')
    FROM posts p
    WHERE p.id IN (SELECT id FROM posts ORDER BY created_at DESC LIMIT 8)
    ON CONFLICT (post_id, user_id) DO NOTHING;

    -- ============================================
    -- 插入地图便便数据
    -- ============================================
    
    INSERT INTO map_poops (user_id, position, created_at)
    VALUES
    (user1_id, 15, NOW() - INTERVAL '1 day'),
    (user1_id, 23, NOW() - INTERVAL '2 days'),
    (user1_id, 45, NOW() - INTERVAL '3 days'),
    (user2_id, 12, NOW() - INTERVAL '1 day' + INTERVAL '2 hours'),
    (user2_id, 34, NOW() - INTERVAL '2 days' + INTERVAL '4 hours'),
    (user2_id, 56, NOW() - INTERVAL '3 days' + INTERVAL '6 hours'),
    (user3_id, 8, NOW() - INTERVAL '1 day' + INTERVAL '1 hour'),
    (user3_id, 28, NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),
    (user3_id, 67, NOW() - INTERVAL '3 days' + INTERVAL '5 hours'),
    (user1_id, 19, NOW() - INTERVAL '4 days'),
    (user2_id, 41, NOW() - INTERVAL '4 days' + INTERVAL '2 hours'),
    (user3_id, 73, NOW() - INTERVAL '4 days' + INTERVAL '4 hours'),
    (user1_id, 5, NOW() - INTERVAL '5 days'),
    (user2_id, 37, NOW() - INTERVAL '5 days' + INTERVAL '1 hour'),
    (user3_id, 82, NOW() - INTERVAL '5 days' + INTERVAL '3 hours');

    -- ============================================
    -- 插入建筑数据
    -- ============================================
    
    INSERT INTO buildings (name, position, user_id, created_at)
    VALUES
    ('办公楼A', 50, user1_id, NOW() - INTERVAL '5 days'),
    ('办公楼B', 67, user2_id, NOW() - INTERVAL '6 days'),
    ('办公楼C', 25, user3_id, NOW() - INTERVAL '7 days'),
    ('商业大厦', 88, user1_id, NOW() - INTERVAL '8 days'),
    ('科技园区', 33, user2_id, NOW() - INTERVAL '9 days');

    -- ============================================
    -- 更新帖子统计（点赞数和评论数）
    -- ============================================
    
    -- 更新点赞数
    UPDATE posts p
    SET likes_count = (
        SELECT COUNT(*) 
        FROM likes l 
        WHERE l.post_id = p.id
    );

    -- 更新评论数
    UPDATE posts p
    SET comments_count = (
        SELECT COUNT(*) 
        FROM comments c 
        WHERE c.post_id = p.id
    );

    RAISE NOTICE '✅ 测试数据插入完成！';
    RAISE NOTICE '用户1 ID: %', user1_id;
    RAISE NOTICE '用户2 ID: %', user2_id;
    RAISE NOTICE '用户3 ID: %', user3_id;
END $$;

-- ============================================
-- 验证数据
-- ============================================

-- 查看插入的帖子数量
SELECT COUNT(*) as post_count FROM posts;

-- 查看帖子列表
SELECT id, text_content, likes_count, comments_count, created_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 10;

-- 查看点赞数统计
SELECT COUNT(*) as total_likes FROM likes;

-- 查看评论数统计
SELECT COUNT(*) as total_comments FROM comments;

-- 查看收藏数统计
SELECT COUNT(*) as total_favorites FROM favorites;

-- 查看地图便便数
SELECT COUNT(*) as total_poops FROM map_poops;

-- 查看建筑数
SELECT COUNT(*) as total_buildings FROM buildings;
