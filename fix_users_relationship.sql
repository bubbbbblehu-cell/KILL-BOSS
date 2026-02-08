-- ============================================
-- 修复 users 表关系问题
-- 解决 "Could not find a relationship between 'posts' and 'users'" 错误
-- ============================================

-- 步骤1：确保 public.users 表存在
-- 如果还没有执行 create_users_table.sql，先执行它
-- 或者直接执行以下创建语句：

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- 启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许所有人读取用户基本信息
DROP POLICY IF EXISTS "Anyone can read users" ON public.users;
CREATE POLICY "Anyone can read users"
ON public.users FOR SELECT
USING (true);

-- RLS 策略：允许用户更新自己的信息
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid()::uuid = id::uuid);

-- RLS 策略：允许系统插入新用户
DROP POLICY IF EXISTS "System can insert users" ON public.users;
CREATE POLICY "System can insert users"
ON public.users FOR INSERT
WITH CHECK (true);

-- ============================================
-- 步骤2：同步已存在的用户到 public.users 表
-- ============================================

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
-- 步骤3：创建触发器（如果还没有）
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
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 步骤4：验证 users 表数据
-- ============================================

SELECT COUNT(*) as users_count FROM public.users;

SELECT id, email, name FROM public.users LIMIT 5;

-- ============================================
-- 完成！
-- ============================================
-- 现在前端代码应该可以正常关联查询 users 表了
-- 如果还有问题，可能需要刷新 Supabase 的 schema cache