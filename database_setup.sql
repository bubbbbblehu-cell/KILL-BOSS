-- ============================================
-- BOSS KILL 数据库表结构创建脚本
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 1. 创建 posts 表（帖子）
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text_content TEXT,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count DESC);

-- 启用 RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许所有人读取
DROP POLICY IF EXISTS "Anyone can read posts" ON posts;
CREATE POLICY "Anyone can read posts"
ON posts FOR SELECT
USING (true);

-- RLS 策略：允许认证用户插入
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;
CREATE POLICY "Authenticated users can insert posts"
ON posts FOR INSERT
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- RLS 策略：允许作者更新自己的帖子
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid()::uuid = user_id::uuid);

-- RLS 策略：允许作者删除自己的帖子
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
USING (auth.uid()::uuid = user_id::uuid);

-- ============================================

-- 2. 创建 comments 表（评论）
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 启用 RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许所有人读取
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
CREATE POLICY "Anyone can read comments"
ON comments FOR SELECT
USING (true);

-- RLS 策略：允许认证用户插入
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
CREATE POLICY "Authenticated users can insert comments"
ON comments FOR INSERT
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- RLS 策略：允许用户删除自己的评论
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
USING (auth.uid()::uuid = user_id::uuid);

-- ============================================

-- 3. 创建 likes 表（点赞）
CREATE TABLE IF NOT EXISTS likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

-- 启用 RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许所有人读取
DROP POLICY IF EXISTS "Anyone can read likes" ON likes;
CREATE POLICY "Anyone can read likes"
ON likes FOR SELECT
USING (true);

-- RLS 策略：允许认证用户插入
DROP POLICY IF EXISTS "Authenticated users can insert likes" ON likes;
CREATE POLICY "Authenticated users can insert likes"
ON likes FOR INSERT
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- RLS 策略：允许用户删除自己的点赞
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
CREATE POLICY "Users can delete own likes"
ON likes FOR DELETE
USING (auth.uid()::uuid = user_id::uuid);

-- ============================================

-- 4. 创建 favorites 表（收藏）
CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_favorites_post_id ON favorites(post_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- 启用 RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许用户读取自己的收藏
DROP POLICY IF EXISTS "Users can read own favorites" ON favorites;
CREATE POLICY "Users can read own favorites"
ON favorites FOR SELECT
USING (auth.uid()::uuid = user_id::uuid);

-- RLS 策略：允许认证用户插入
DROP POLICY IF EXISTS "Authenticated users can insert favorites" ON favorites;
CREATE POLICY "Authenticated users can insert favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- RLS 策略：允许用户删除自己的收藏
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
USING (auth.uid()::uuid = user_id::uuid);

-- ============================================

-- 5. 创建 notifications 表（通知）
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    related_post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 启用 RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许用户读取自己的通知
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
USING (auth.uid()::uuid = user_id::uuid);

-- RLS 策略：允许系统插入通知（所有认证用户）
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- RLS 策略：允许用户更新自己的通知
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid()::uuid = user_id::uuid);

-- ============================================

-- 6. 创建 map_poops 表（地图便便）
CREATE TABLE IF NOT EXISTS map_poops (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0 AND position < 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_map_poops_position ON map_poops(position);
CREATE INDEX IF NOT EXISTS idx_map_poops_user_id ON map_poops(user_id);

-- 启用 RLS
ALTER TABLE map_poops ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许所有人读取
DROP POLICY IF EXISTS "Anyone can read map poops" ON map_poops;
CREATE POLICY "Anyone can read map poops"
ON map_poops FOR SELECT
USING (true);

-- RLS 策略：允许认证用户插入
DROP POLICY IF EXISTS "Authenticated users can insert map poops" ON map_poops;
CREATE POLICY "Authenticated users can insert map poops"
ON map_poops FOR INSERT
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- ============================================

-- 7. 创建 buildings 表（建筑）
CREATE TABLE IF NOT EXISTS buildings (
    id BIGSERIAL PRIMARY KEY,
    name TEXT,
    position INTEGER NOT NULL CHECK (position >= 0 AND position < 100),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_buildings_position ON buildings(position);

-- 启用 RLS
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许所有人读取
DROP POLICY IF EXISTS "Anyone can read buildings" ON buildings;
CREATE POLICY "Anyone can read buildings"
ON buildings FOR SELECT
USING (true);

-- RLS 策略：允许认证用户插入
DROP POLICY IF EXISTS "Authenticated users can insert buildings" ON buildings;
CREATE POLICY "Authenticated users can insert buildings"
ON buildings FOR INSERT
WITH CHECK (true);

-- ============================================

-- 8. 创建触发器函数：自动更新帖子点赞数
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON likes;
CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- ============================================

-- 9. 创建触发器函数：自动更新帖子评论数
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON comments;
CREATE TRIGGER trigger_update_post_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- ============================================
-- 脚本执行完成
-- ============================================
