# Supabase 连接问题排查清单

根据控制台错误 `TypeError: Failed to fetch`，请按以下步骤检查 Supabase 配置：

## 🔍 第一步：检查 API Key

1. **登录 Supabase 控制台**
   - 访问：https://supabase.com/dashboard
   - 选择你的项目：`rjqdxxwurocqsewvtduf`

2. **获取正确的 API Key**
   - 进入：**Project Settings** → **API**
   - 找到 **Project API keys** 部分
   - **重要**：复制 **`anon`** 或 **`public`** key（不是 `service_role` key）
   - 正确的 key 格式应该是：
     - 旧格式：以 `eyJ` 开头的 JWT token（很长的一串）
     - 新格式：以 `sb_publishable_` 开头的字符串

3. **更新代码中的 Key**
   - 如果 key 格式不对，请更新 `main.js` 第 27 行的 `supabaseKey` 变量

## 🗄️ 第二步：检查数据库表

1. **确认表是否存在**
   - 进入：**Table Editor**（左侧菜单）
   - 检查是否存在 `buildings` 表
   - 如果不存在，需要创建该表

2. **创建 buildings 表（如果不存在）**
   ```sql
   CREATE TABLE buildings (
     id BIGSERIAL PRIMARY KEY,
     name TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

## 🔒 第三步：检查 Row Level Security (RLS)

1. **检查 RLS 策略**
   - 进入：**Table Editor** → 选择 `buildings` 表
   - 点击 **Policies** 标签
   - **如果 RLS 已启用但没有策略**，会导致查询失败

2. **解决方案（三选一）**

   **选项 A：禁用 RLS（仅用于开发测试）**
   - 在表设置中，关闭 **Enable Row Level Security**
   - ⚠️ **警告**：生产环境不建议这样做

   **选项 B：添加允许匿名访问的策略（推荐）**
   ```sql
   -- 允许所有人读取
   CREATE POLICY "Allow public read access"
   ON buildings FOR SELECT
   USING (true);
   
   -- 允许所有人插入
   CREATE POLICY "Allow public insert access"
   ON buildings FOR INSERT
   WITH CHECK (true);
   ```

   **选项 C：使用 Service Role Key（不推荐，仅用于测试）**
   - 使用 `service_role` key 可以绕过 RLS
   - ⚠️ **警告**：不要在前端代码中使用 service_role key！

## 🌐 第四步：检查网络和 CORS

1. **检查项目 URL**
   - 确认 `main.js` 中的 URL：`https://rjqdxxwurocqsewvtduf.supabase.co`
   - 在浏览器中直接访问：`https://rjqdxxwurocqsewvtduf.supabase.co/rest/v1/`
   - 应该能看到 JSON 响应（即使返回错误）

2. **检查 CORS 设置**
   - 进入：**Project Settings** → **API**
   - 确认 **Allowed Origins** 包含你的域名
   - 如果部署在 Vercel，添加：`https://kill-boss.vercel.app`

## 🧪 第五步：测试连接

在浏览器控制台运行以下代码进行测试：

```javascript
// 测试 1：检查 Supabase 对象
console.log('Supabase:', typeof supabase);

// 测试 2：创建客户端
const testClient = supabase.createClient(
  'https://rjqdxxwurocqsewvtduf.supabase.co',
  '你的API_KEY'
);

// 测试 3：尝试查询
testClient.from('buildings').select('*').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ 查询失败:', error);
      console.error('错误代码:', error.code);
      console.error('错误消息:', error.message);
    } else {
      console.log('✅ 查询成功:', data);
    }
  });
```

## 📋 常见错误代码对照表

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| `PGRST116` | 表不存在 | 创建表或修改表名 |
| `PGRST301` | JWT 无效 | 检查 API key 是否正确 |
| `42501` | 权限不足 | 检查 RLS 策略 |
| `Failed to fetch` | 网络错误 | 检查网络连接和 CORS |

## 🚀 快速修复步骤（推荐）

1. **获取正确的 API Key**
   - Supabase 控制台 → Project Settings → API → 复制 `anon` key

2. **创建 buildings 表**
   ```sql
   CREATE TABLE buildings (
     id BIGSERIAL PRIMARY KEY,
     name TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **添加 RLS 策略（允许匿名读取）**
   ```sql
   ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Allow anonymous read"
   ON buildings FOR SELECT
   USING (true);
   ```

4. **更新代码中的 API Key**
   - 修改 `main.js` 中的 `supabaseKey` 变量

5. **刷新页面测试**

## 💡 如果还是不行

运行诊断函数：
```javascript
diagnoseSupabase()
```

查看详细错误信息，然后根据错误代码对照表解决问题。
