/**
 * 地图模块 - 地图视图功能
 * 处理地图显示、交互等
 */

import { getSupabaseClient } from '../../supabase.js';
import { appState } from '../../state.js';

let mapInstance = null;

/**
 * 初始化地图
 */
export async function initMap() {
    console.log("🗺️ 初始化地图...");
    
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) {
        console.warn("⚠️ 地图容器不存在");
        return;
    }

    // 创建地图网格
    createMapGrid(mapContainer);
    
    // 加载地图数据
    await loadMapData();
}

/**
 * 创建地图网格
 */
function createMapGrid(container) {
    const grid = container.querySelector('.map-grid');
    if (!grid) return;

    // 创建 10x10 网格
    grid.innerHTML = '';
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'map-cell';
        cell.dataset.index = i;
        grid.appendChild(cell);
    }
}

/**
 * 加载地图数据
 */
async function loadMapData() {
    const client = getSupabaseClient();
    if (!client) {
        console.warn("⚠️ Supabase 未就绪，使用模拟数据");
        renderMapMarkers(getMockMapData());
        return;
    }

    try {
        // 加载便便标记
        const { data: poops, error: poopsError } = await client
            .from('map_poops')
            .select('*');

        // 加载建筑标记
        const { data: buildings, error: buildingsError } = await client
            .from('buildings')
            .select('*');

        if (poopsError || buildingsError) {
            console.error("❌ 加载地图数据失败");
            renderMapMarkers(getMockMapData());
        } else {
            renderMapMarkers({ poops: poops || [], buildings: buildings || [] });
        }
    } catch (err) {
        console.error("❌ 加载地图数据异常:", err);
        renderMapMarkers(getMockMapData());
    }
}

/**
 * 渲染地图标记
 */
function renderMapMarkers(data) {
    const grid = document.querySelector('.map-grid');
    if (!grid) return;

    // 渲染便便
    data.poops.forEach(poop => {
        const cell = grid.children[poop.position];
        if (cell) {
            const marker = document.createElement('div');
            marker.className = 'map-marker poop-marker';
            marker.textContent = '💩';
            marker.title = `便便 #${poop.id}`;
            cell.appendChild(marker);
        }
    });

    // 渲染建筑
    data.buildings.forEach(building => {
        const cell = grid.children[building.position];
        if (cell) {
            const marker = document.createElement('div');
            marker.className = 'map-marker building-marker';
            marker.textContent = '🏢';
            marker.title = building.name || `建筑 #${building.id}`;
            cell.appendChild(marker);
        }
    });
}

/**
 * 获取模拟地图数据
 */
function getMockMapData() {
    return {
        poops: [
            { id: 1, position: 15 },
            { id: 2, position: 23 },
            { id: 3, position: 45 }
        ],
        buildings: [
            { id: 1, position: 50, name: '办公楼A' },
            { id: 2, position: 67, name: '办公楼B' }
        ]
    };
}

/**
 * 扔便便
 */
export async function throwPoop(position) {
    if (!appState.user || appState.isGuest) {
        alert("请先登录");
        return;
    }

    const client = getSupabaseClient();
    if (!client) {
        alert("网络连接异常");
        return;
    }

    try {
        const { data, error } = await client
            .from('map_poops')
            .insert({
                user_id: appState.user.id,
                position: position || Math.floor(Math.random() * 100)
            })
            .select()
            .single();

        if (error) {
            console.error("❌ 扔便便失败:", error);
            alert("操作失败: " + error.message);
            return;
        }

        console.log("✅ 便便已扔出:", data);
        
        // 更新UI
        appState.poopCount++;
        updatePoopCount();
        
        // 重新加载地图
        await loadMapData();
    } catch (err) {
        console.error("❌ 扔便便异常:", err);
        alert("操作失败，请稍后重试");
    }
}

/**
 * 更新便便计数
 */
function updatePoopCount() {
    const countEl = document.getElementById('poopCount');
    if (countEl) {
        countEl.textContent = appState.poopCount;
    }
}

// 导出到 window
window.throwPoop = throwPoop;
