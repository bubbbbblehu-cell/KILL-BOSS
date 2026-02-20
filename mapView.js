/**
 * mapView.js - 地图显示，便便和建筑标记模块
 * BOSS KILL 项目
 */

// 地图数据
const mapData = {
    userLocation: null,
    shitPoints: [],
    buildings: [],
    towers: [],
    viewport: {
        center: { lat: 0, lng: 0 },
        zoom: 15,
        bounds: null
    },
    lastUpdate: null,
    updateInterval: 4 * 60 * 60 * 1000, // 4小时
    realtimeUpdateInterval: 5000 // 5秒
};

// 便便点数据结构
class ShitPoint {
    constructor(data) {
        this.id = data.id;
        this.userId = data.user_id;
        this.position = { lat: data.latitude, lng: data.longitude };
        this.type = data.shit_type || 'normal';
        this.timestamp = new Date(data.created_at);
        this.emoji = this.getEmojiByType();
    }

    getEmojiByType() {
        const emojiMap = {
            normal: '💩',
            golden: '✨',
            rainbow: '🌈',
            fire: '🔥'
        };
        return emojiMap[this.type] || '💩';
    }

    getTimeAgo() {
        const now = new Date();
        const diff = now - this.timestamp;
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (hours < 1) return '刚刚';
        if (hours < 24) return `${hours}小时前`;
        return `${days}天前`;
    }
}

// 建筑物数据结构
class Building {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.position = { lat: data.latitude, lng: data.longitude };
        this.type = data.building_type || 'office';
        this.isOccupied = data.is_occupied || false;
        this.occupiedBy = data.occupied_by || null;
        this.nearbyShitCount = data.nearby_shit_count || 0;
    }

    getEmoji() {
        const emojiMap = {
            office: '🏢',
            residential: '🏠',
            commercial: '🏬',
            factory: '🏭',
            school: '🏫'
        };
        return emojiMap[this.type] || '🏢';
    }
}

// 屎塔数据结构
class ShitTower {
    constructor(data) {
        this.id = data.id;
        this.position = { lat: data.latitude, lng: data.longitude };
        this.shitCount = data.shit_count;
        this.height = data.height;
        this.contributorIds = data.contributor_ids || [];
        this.occupiedBuilding = data.occupied_building || null;
        this.createdAt = new Date(data.created_at);
    }

    getDisplayHeight() {
        return `${this.height.toFixed(1)}米`;
    }
}

/**
 * 初始化地图
 */
async function initMap() {
    try {
        if (typeof showLoading === 'function') {
            showLoading('加载地图...');
        }
        
        // 获取用户位置
        const userLocation = await getUserLocation();
        mapData.userLocation = userLocation;
        mapData.viewport.center = userLocation;
        
        // 初始化Canvas
        initMapCanvas();
        
        // 加载地图数据
        await loadMapData();
        
        // 渲染地图
        renderMap();
        
        console.log('地图初始化成功');
    } catch (error) {
        console.error('地图初始化失败:', error);
        showToast('地图加载失败，请检查定位权限');
    } finally {
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
    }
}

/**
 * 获取用户位置
 */
async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('浏览器不支持定位'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                console.error('定位失败:', error);
                // 使用默认位置（西双版纳景洪市中心）
                resolve({ lat: 21.9621, lng: 100.7979 });
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

/**
 * 初始化Canvas
 */
function initMapCanvas() {
    const canvas = document.getElementById('mapCanvas');
    const container = document.getElementById('mapContainer');
    
    if (!canvas || !container) return;
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // 添加触摸事件监听
    addMapInteractionListeners(canvas);
}

/**
 * 添加地图交互监听
 */
function addMapInteractionListeners(canvas) {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('touchstart', startDrag);
    
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('touchmove', drag);
    
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('touchend', endDrag);
    
    canvas.addEventListener('wheel', handleZoom);
    
    function startDrag(e) {
        isDragging = true;
        const point = getEventPoint(e);
        lastX = point.x;
        lastY = point.y;
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const point = getEventPoint(e);
        const dx = point.x - lastX;
        const dy = point.y - lastY;
        
        panMap(dx, dy);
        
        lastX = point.x;
        lastY = point.y;
        
        renderMap();
    }
    
    function endDrag() {
        isDragging = false;
    }
    
    function handleZoom(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        zoomMap(delta);
        renderMap();
    }
    
    function getEventPoint(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }
}

/**
 * 加载地图数据
 */
async function loadMapData() {
    try {
        const radius = 5; // 5公里范围
        
        // 从 Supabase 加载西双版纳的酒店数据
        const xishuangbannaId = '56fe3f17-3dfc-4c14-a745-d2ab37226514';
        
        if (typeof supabase !== 'undefined') {
            console.log('开始从数据库加载西双版纳酒店数据...');
            
            const { data: hotels, error } = await supabase
                .from('hotels')
                .select('*')
                .eq('city_id', xishuangbannaId);
            
            if (error) {
                console.error('查询酒店数据失败:', error);
                // 使用模拟数据作为后备
                useMockData();
            } else if (hotels && hotels.length > 0) {
                console.log(`✅ 成功加载 ${hotels.length} 个西双版纳酒店数据`);
                
                // 将酒店数据转换为建筑标记
                mapData.buildings = hotels.map(hotel => new Building({
                    id: hotel.id,
                    name: hotel.name,
                    latitude: hotel.latitude,
                    longitude: hotel.longitude,
                    building_type: 'office', // 酒店类型
                    is_occupied: false,
                    occupied_by: null,
                    nearby_shit_count: 0
                }));
                
                // 生成少量模拟便便和屎塔数据
                mapData.shitPoints = generateMockShitPoints(50).map(s => new ShitPoint(s));
                mapData.towers = generateMockTowers(3).map(t => new ShitTower(t));
            } else {
                console.warn('未查询到西双版纳酒店数据，使用模拟数据');
                useMockData();
            }
        } else {
            console.warn('Supabase 未加载，使用模拟数据');
            useMockData();
        }
        
        mapData.lastUpdate = new Date();
        
        // 更新信息面板
        updateMapInfoPanel();
        
        console.log(`地图数据加载完成: ${mapData.shitPoints.length}个便便, ${mapData.towers.length}个屎塔, ${mapData.buildings.length}个建筑`);
    } catch (error) {
        console.error('加载地图数据失败:', error);
        useMockData();
    }
}

/**
 * 使用模拟数据（后备方案）
 */
function useMockData() {
    mapData.shitPoints = generateMockShitPoints(50).map(s => new ShitPoint(s));
    mapData.towers = generateMockTowers(3).map(t => new ShitTower(t));
    mapData.buildings = generateMockBuildings(10).map(b => new Building(b));
}

/**
 * 生成模拟便便点数据
 */
function generateMockShitPoints(count) {
    const points = [];
    // 使用西双版纳的坐标作为基准
    const baseLatLng = mapData.userLocation || { lat: 21.9621, lng: 100.7979 };
    
    for (let i = 0; i < count; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.02;
        const offsetLng = (Math.random() - 0.5) * 0.02;
        
        points.push({
            id: `shit_${i}`,
            user_id: Math.random() > 0.3 ? 'other_user' : 'user_001',
            latitude: baseLatLng.lat + offsetLat,
            longitude: baseLatLng.lng + offsetLng,
            shit_type: ['normal', 'golden', 'rainbow', 'fire'][Math.floor(Math.random() * 4)],
            created_at: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
        });
    }
    
    return points;
}

/**
 * 生成模拟屎塔数据
 */
function generateMockTowers(count) {
    const towers = [];
    // 使用西双版纳的坐标作为基准
    const baseLatLng = mapData.userLocation || { lat: 21.9621, lng: 100.7979 };
    
    for (let i = 0; i < count; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.015;
        const offsetLng = (Math.random() - 0.5) * 0.015;
        const shitCount = 1000 + Math.floor(Math.random() * 5000);
        
        towers.push({
            id: `tower_${i}`,
            latitude: baseLatLng.lat + offsetLat,
            longitude: baseLatLng.lng + offsetLng,
            shit_count: shitCount,
            height: shitCount / 100,
            contributor_ids: [],
            occupied_building: `building_${i}`,
            created_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
        });
    }
    
    return towers;
}

/**
 * 生成模拟建筑数据
 */
function generateMockBuildings(count) {
    const buildings = [];
    // 使用西双版纳的坐标作为基准
    const baseLatLng = mapData.userLocation || { lat: 21.9621, lng: 100.7979 };
    const buildingNames = ['科技大厦', '金融中心', '创业园区', '商业广场', '写字楼'];
    
    for (let i = 0; i < count; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.02;
        const offsetLng = (Math.random() - 0.5) * 0.02;
        
        buildings.push({
            id: `building_${i}`,
            name: buildingNames[Math.floor(Math.random() * buildingNames.length)] + (i + 1) + '号',
            latitude: baseLatLng.lat + offsetLat,
            longitude: baseLatLng.lng + offsetLng,
            building_type: ['office', 'residential', 'commercial'][Math.floor(Math.random() * 3)],
            is_occupied: Math.random() > 0.7,
            occupied_by: Math.random() > 0.7 ? `tower_${Math.floor(Math.random() * 3)}` : null,
            nearby_shit_count: Math.floor(Math.random() * 1000)
        });
    }
    
    return buildings;
}

/**
 * 更新信息面板
 */
function updateMapInfoPanel() {
    const elements = {
        nearbyShitCount: mapData.shitPoints.length,
        nearbyBuildingCount: mapData.buildings.length,
        nearbyTowerCount: mapData.towers.length
    };

    Object.keys(elements).forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.textContent = elements[id];
    });
}

/**
 * 渲染地图
 */
function renderMap() {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景
    drawMapBackground(ctx, canvas);
    
    // 绘制网格
    drawMapGrid(ctx, canvas);
    
    // 更新标记位置
    updateMarkerPositions();
    
    // 更新用户位置标记
    updateUserMarker();
}

/**
 * 绘制地图背景
 */
function drawMapBackground(ctx, canvas) {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * 绘制地图网格
 */
function drawMapGrid(ctx, canvas) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

/**
 * 更新标记位置
 */
function updateMarkerPositions() {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 清空现有标记
    ['shitMarkersLayer', 'buildingMarkersLayer', 'towerMarkersLayer'].forEach(id => {
        const layer = document.getElementById(id);
        if (layer) layer.innerHTML = '';
    });
    
    // 渲染便便标记
    mapData.shitPoints.forEach(shit => {
        const screenPos = latLngToScreen(shit.position, centerX, centerY);
        if (isInViewport(screenPos, canvas)) {
            createShitMarker(shit, screenPos);
        }
    });
    
    // 渲染建筑标记
    mapData.buildings.forEach(building => {
        const screenPos = latLngToScreen(building.position, centerX, centerY);
        if (isInViewport(screenPos, canvas)) {
            createBuildingMarker(building, screenPos);
        }
    });
    
    // 渲染屎塔标记
    mapData.towers.forEach(tower => {
        const screenPos = latLngToScreen(tower.position, centerX, centerY);
        if (isInViewport(screenPos, canvas)) {
            createTowerMarker(tower, screenPos);
        }
    });
}

/**
 * 经纬度转屏幕坐标
 */
function latLngToScreen(latLng, centerX, centerY) {
    const scale = Math.pow(2, mapData.viewport.zoom) * 100;
    
    const dx = (latLng.lng - mapData.viewport.center.lng) * scale;
    const dy = (mapData.viewport.center.lat - latLng.lat) * scale;
    
    return {
        x: centerX + dx,
        y: centerY + dy
    };
}

/**
 * 判断是否在视口内
 */
function isInViewport(pos, canvas) {
    return pos.x >= -50 && pos.x <= canvas.width + 50 &&
           pos.y >= -50 && pos.y <= canvas.height + 50;
}

/**
 * 创建便便标记
 */
function createShitMarker(shit, pos) {
    const marker = document.createElement('div');
    marker.className = 'map-marker shit-marker';
    marker.style.left = pos.x + 'px';
    marker.style.top = pos.y + 'px';
    marker.textContent = shit.emoji;
    marker.onclick = () => showToast(`便便点 - ${shit.getTimeAgo()}`);
    
    const layer = document.getElementById('shitMarkersLayer');
    if (layer) layer.appendChild(marker);
}

/**
 * 创建建筑标记
 */
function createBuildingMarker(building, pos) {
    const marker = document.createElement('div');
    marker.className = 'map-marker building-marker';
    marker.style.left = pos.x + 'px';
    marker.style.top = pos.y + 'px';
    marker.textContent = building.getEmoji();
    marker.onclick = () => showToast(`${building.name} - ${building.nearbyShitCount}个便便`);
    
    const layer = document.getElementById('buildingMarkersLayer');
    if (layer) layer.appendChild(marker);
}

/**
 * 创建屎塔标记
 */
function createTowerMarker(tower, pos) {
    const marker = document.createElement('div');
    marker.className = 'map-marker tower-marker';
    marker.style.left = pos.x + 'px';
    marker.style.top = pos.y + 'px';
    marker.textContent = '🗼';
    marker.onclick = () => showToast(`屎塔 - 高度${tower.getDisplayHeight()}`);
    
    const layer = document.getElementById('towerMarkersLayer');
    if (layer) layer.appendChild(marker);
}

/**
 * 更新用户位置标记
 */
function updateUserMarker() {
    const canvas = document.getElementById('mapCanvas');
    const userMarker = document.getElementById('userMarker');
    
    if (!canvas || !userMarker) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const screenPos = latLngToScreen(mapData.userLocation, centerX, centerY);
    
    userMarker.style.left = screenPos.x + 'px';
    userMarker.style.top = screenPos.y + 'px';
}

/**
 * 平移地图
 */
function panMap(dx, dy) {
    const scale = Math.pow(2, mapData.viewport.zoom) * 100;
    
    mapData.viewport.center.lng -= dx / scale;
    mapData.viewport.center.lat += dy / scale;
}

/**
 * 缩放地图
 */
function zoomMap(delta) {
    mapData.viewport.zoom = Math.max(10, Math.min(18, mapData.viewport.zoom + delta));
}

/**
 * 定位到用户
 */
async function centerToUser() {
    try {
        const location = await getUserLocation();
        mapData.userLocation = location;
        mapData.viewport.center = location;
        renderMap();
        showToast('已定位到当前位置');
    } catch (error) {
        console.error('定位失败:', error);
        showToast('定位失败，请检查权限');
    }
}

/**
 * 刷新地图
 */
async function refreshMap() {
    try {
        if (typeof showLoading === 'function') {
            showLoading('刷新中...');
        }
        await loadMapData();
        renderMap();
        showToast('刷新成功');
    } catch (error) {
        console.error('刷新失败:', error);
        showToast('刷新失败，请重试');
    } finally {
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
    }
}

/**
 * 显示/隐藏图例
 */
function showMapLegend() {
    const legend = document.getElementById('mapLegend');
    if (legend) legend.style.display = 'block';
}

function closeMapLegend() {
    const legend = document.getElementById('mapLegend');
    if (legend) legend.style.display = 'none';
}

/**
 * 扔便便
 */
async function throwShit() {
    try {
        if (!mapData.userLocation) {
            showToast('请先开启定位');
            return;
        }
        
        if (typeof showLoading === 'function') {
            showLoading('扔便便中...');
        }
        
        // 添加到本地数据
        const newShit = new ShitPoint({
            id: 'shit_' + Date.now(),
            user_id: 'user_001',
            latitude: mapData.userLocation.lat,
            longitude: mapData.userLocation.lng,
            shit_type: 'normal',
            created_at: new Date().toISOString()
        });
        
        mapData.shitPoints.push(newShit);
        
        showToast('扔便便成功！');
        
        // 重新渲染
        renderMap();
        updateMapInfoPanel();
        
        console.log('扔便便成功');
    } catch (error) {
        console.error('扔便便失败:', error);
        showToast('扔便便失败，请重试');
    } finally {
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
    }
}

// 工具函数
if (typeof showToast !== 'function') {
    window.showToast = function(message) {
        alert(message);
    };
}

console.log('✅ mapView.js 模块已加载');

