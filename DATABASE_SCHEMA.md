# 数据库表结构设计

## 📊 表结构概览

### 1. posts 表（帖子）
存储用户发布的帖子

```sql
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text_content TEXT,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_likes_count ON posts(likes_count DESC);

-- RLS 策略
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取
CREATE POLICY "Anyone can read posts"
ON posts FOR SELECT
USING (true);

-- 允许认证用户插入
CREATE POLICY "Authenticated users can insert posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 允许作者更新自己的帖子
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id);

-- 允许作者删除自己的帖子
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
USING (auth.uid() = user_id);
```

### 2. comments 表（评论）
存储帖子的评论

```sql
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE, -- 支持回复
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- RLS 策略
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
ON comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);
```

### 3. likes 表（点赞）
存储用户对帖子的点赞

```sql
CREATE TABLE likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id) -- 防止重复点赞
);

-- 索引
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- RLS 策略
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
ON likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert likes"
ON likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
ON likes FOR DELETE
USING (auth.uid() = user_id);
```

### 4. favorites 表（收藏）
存储用户收藏的帖子

```sql
CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id) -- 防止重复收藏
);

-- 索引
CREATE INDEX idx_favorites_post_id ON favorites(post_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- RLS 策略
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites"
ON favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
USING (auth.uid() = user_id);
```

### 5. notifications 表（通知）
存储用户的通知消息

```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- like, comment, follow, system
    content TEXT NOT NULL,
    related_post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS 策略
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);
```

### 6. map_poops 表（地图便便）
存储地图上的便便标记

```sql
CREATE TABLE map_poops (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0 AND position < 100), -- 0-99 网格位置
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_map_poops_position ON map_poops(position);
CREATE INDEX idx_map_poops_user_id ON map_poops(user_id);

-- RLS 策略
ALTER TABLE map_poops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read map poops"
ON map_poops FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert map poops"
ON map_poops FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 7. buildings 表（建筑）
存储地图上的建筑标记

```sql
CREATE TABLE buildings (
    id BIGSERIAL PRIMARY KEY,
    name TEXT,
    position INTEGER NOT NULL CHECK (position >= 0 AND position < 100),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_buildings_position ON buildings(position);

-- RLS 策略
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read buildings"
ON buildings FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert buildings"
ON buildings FOR INSERT
WITH CHECK (true);
```

## 🔄 触发器函数

### 自动更新帖子统计

```sql
-- 更新帖子点赞数
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- 更新帖子评论数
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
```

## 📦 Storage Buckets

### post-images bucket（帖子图片存储）

```sql
-- 在 Supabase Dashboard 中创建 Storage Bucket
-- Bucket 名称: post-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
```

## 🚀 快速设置脚本

在 Supabase SQL Editor 中运行以下脚本可以快速创建所有表：

```sql
-- 注意：需要先创建 Storage Bucket: post-images

-- 1. 创建 posts 表
-- （见上面的 SQL）

-- 2. 创建 comments 表
-- （见上面的 SQL）

-- 3. 创建 likes 表
-- （见上面的 SQL）

-- 4. 创建 favorites 表
-- （见上面的 SQL）

-- 5. 创建 notifications 表
-- （见上面的 SQL）

-- 6. 创建 map_poops 表
-- （见上面的 SQL）

-- 7. 创建 buildings 表（如果还没有）
-- （见上面的 SQL）

-- 8. 创建触发器
-- （见上面的 SQL）
```

## 📝 注意事项

1. **用户表**: Supabase Auth 自动管理 `auth.users` 表，无需手动创建
2. **RLS 策略**: 所有表都启用了 Row Level Security，确保数据安全
3. **外键约束**: 使用 `ON DELETE CASCADE` 确保数据一致性
4. **索引优化**: 为常用查询字段创建了索引
5. **统计更新**: 使用触发器自动更新帖子的点赞数和评论数
