-- ============================================
-- 创建自定义 users 表（用户资料表）
-- 用于存储用户的额外信息，如昵称、头像等
-- ============================================

-- 1. 创建 users 表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许所有人读取用户基本信息
DROP POLICY IF EXISTS "Anyone can read users" ON users;
CREATE POLICY "Anyone can read users"
ON users FOR SELECT
USING (true);

-- RLS 策略：允许用户更新自己的信息
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::uuid = id::uuid);

-- RLS 策略：允许系统插入新用户（通过触发器）
DROP POLICY IF EXISTS "System can insert users" ON users;
CREATE POLICY "System can insert users"
ON users FOR INSERT
WITH CHECK (true);

-- ============================================
-- 2. 创建触发器函数：当 auth.users 中有新用户注册时，自动在 users 表中创建记录
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), '用户'),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING; -- 如果已存在则不做任何操作
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：监听 auth.users 表的 INSERT 事件
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 3. 为已存在的用户创建记录（可选：如果之前已经有用户注册了）
-- ============================================

-- 将 auth.users 中已存在但 users 表中不存在的用户同步过来
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1), '用户') as name,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 脚本执行完成
-- ============================================
-- 说明：
-- 1. 此脚本会创建一个 users 表来存储用户的额外信息
-- 2. 触发器会自动在用户注册时创建对应的 users 记录
-- 3. 对于已存在的用户，脚本会自动同步到 users 表
-- 4. 现在注册新用户时，会自动在 users 表中创建记录