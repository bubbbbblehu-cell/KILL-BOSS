{
  "module": "地图视图模块 (Map View Module)",
  "description": "处理地图坐标渲染及地理位置数据交互",
  "types": {
    "MapPoop": {
      "id": "number",
      "user_id": "string",
      "position": "number",
      "created_at": "string"
    },
    "MapPoopWithUser": {
      "extends": "MapPoop",
      "user": {
        "username": "string",
        "avatar_url": "string (optional)"
      }
    },
    "Building": {
      "id": "number",
      "name": "string (optional)",
      "position": "number",
      "user_id": "string (optional)",
      "created_at": "string"
    },
    "BuildingWithUser": {
      "extends": "Building",
      "owner": {
        "username": "string",
        "avatar_url": "string (optional)"
      }
    },
    "MapGridCell": {
      "position": "number",
      "poops": "MapPoopWithUser[]",
      "building": "BuildingWithUser (optional)"
    },
    "MapData": {
      "grid": "MapGridCell[]",
      "stats": {
        "totalPoops": "number",
        "totalBuildings": "number",
        "userPoopsCount": "number",
        "userBuildingsCount": "number"
      }
    }
  },
  "functions": {
    "addPoopToMap": {
      "description": "标记便便到地图",
      "params": {
        "userId": "string",
        "position": "number"
      },
      "returns": "Promise<MapPoop>"
    },
    "removePoopFromMap": {
      "description": "移除便便",
      "params": {
        "poopId": "number",
        "userId": "string"
      },
      "returns": "Promise<void>"
    },
    "getPoopsAtPosition": {
      "description": "获取位置的便便列表",
      "params": {
        "position": "number"
      },
      "returns": "Promise<MapPoopWithUser[]>"
    },
    "getUserPoops": {
      "description": "获取用户的便便列表",
      "params": {
        "userId": "string"
      },
      "returns": "Promise<MapPoop[]>"
    },
    "getAllPoops": {
      "description": "获取所有便便",
      "params": {},
      "returns": "Promise<MapPoopWithUser[]>"
    },
    "buildBuilding": {
      "description": "建造建筑",
      "params": {
        "position": "number",
        "userId": "string",
        "name": "string (optional)"
      },
      "returns": "Promise<Building>"
    },
    "removeBuilding": {
      "description": "删除建筑",
      "params": {
        "buildingId": "number",
        "userId": "string"
      },
      "returns": "Promise<void>"
    },
    "updateBuildingName": {
      "description": "更新建筑名称",
      "params": {
        "buildingId": "number",
        "userId": "string",
        "name": "string"
      },
      "returns": "Promise<Building>"
    },
    "getBuildingAtPosition": {
      "description": "获取位置的建筑",
      "params": {
        "position": "number"
      },
      "returns": "Promise<BuildingWithUser | null>"
    },
    "getUserBuildings": {
      "description": "获取用户的建筑列表",
      "params": {
        "userId": "string"
      },
      "returns": "Promise<Building[]>"
    },
    "getAllBuildings": {
      "description": "获取所有建筑",
      "params": {},
      "returns": "Promise<BuildingWithUser[]>"
    },
    "getCompleteMapData": {
      "description": "获取完整地图数据",
      "params": {
        "userId": "string (optional)"
      },
      "returns": "Promise<MapData>"
    },
    "getMapStats": {
      "description": "获取地图统计信息",
      "params": {},
      "returns": "Promise<{totalPoops: number, totalBuildings: number, topPoopPositions: Array, topBuilders: Array}>"
    },
    "getMapHeatmapData": {
      "description": "获取热力图数据",
      "params": {},
      "returns": "Promise<Array<{position: number, intensity: number, type: string}>>"
    },
    "subscribeToMapUpdates": {
      "description": "订阅地图更新",
      "params": {
        "callback": "function"
      },
      "returns": "() => void"
    },
    "getNearbyMapData": {
      "description": "获取相邻地图数据",
      "params": {
        "position": "number",
        "radius": "number (default: 2)"
      },
      "returns": "Promise<MapGridCell[]>"
    }
  }
}
