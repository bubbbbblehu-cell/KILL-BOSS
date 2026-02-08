/**
 * 应用配置模块
 * 包含所有配置常量和设置
 */

// Supabase 配置
export const SUPABASE_CONFIG = {
    url: 'https://rjqdxxwurocqsewvtduf.supabase.co',
    // 请到 Supabase 控制台 → Project Settings → API → 复制 "anon" / "public"  key
    // 注意：如果使用 sb_publishable_ 开头的 key，需要 Supabase JS v2.39.0+
    key: 'sb_publishable_HDVosfE-j_H7Hogv79aq-A_NwrN0Xsd',
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
