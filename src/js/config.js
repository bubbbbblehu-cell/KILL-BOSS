/**
 * 应用配置模块
 * 包含所有配置常量和设置
 */

// Supabase 配置
export const SUPABASE_CONFIG = {
    url: 'https://rjqdxxwurocqsewvtduf.supabase.co',
    // ⚠️ 重要：请到 Supabase Dashboard → Settings → API → 复制 "anon public" key
    // 正确的 key 格式：以 eyJ 开头的长字符串（JWT token）
    // 如果使用错误的 key，会导致 "Supabase 对象未定义" 错误
    // 
    // 获取步骤：
    // 1. 访问 https://supabase.com/dashboard/project/rjqdxxwurocqsewvtduf/settings/api
    // 2. 找到 "Project API keys" 部分
    // 3. 复制 "anon" / "public" key（不是 service_role key）
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcWR4eHd1cm9jcXNld3Z0ZHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTU5NzcsImV4cCI6MjA1MjMzMTk3N30.请替换为你的实际key',
    version: '2.39.0'
};

// 激励文字库
export const MOTIVATIONAL_QUOTES = [
    "在最好的青春里，在格子间里激励自己开出最美的花！",
    "工作虽苦，但扔大便的快乐谁懂？",
    "老板再坏，也挡不住你扔便便的决心！",
    "每一坨便便，都是对996的无声抗议"
];

// 应用默认配置
export const APP_CONFIG = {
    defaultPoints: 120,
    defaultPoopCount: 0,
    defaultTowerCount: 0,
    defaultBuildingCount: 0,
    defaultCheckinDays: 7,
    defaultWorks: 5
};
