cc.Class({
    extends: cc.Component,

    properties: {
        // 常量定义
        TiledSize:{
            default:90,
            type: cc.Integer,
            tooltip: "单个地格大小"
        },
        MapWidth:{
            default:12,
            type: cc.Integer,
            tooltip: "地图宽度"
        },
        MapHeight:{
            default:4,
            type: cc.Integer,
            tooltip: "地图高度"
        }
    },

    onLoad: function () {
        this.TiledOffset = this.TiledSize / 2;
        this.XSpacing = this.TiledSize * 3 / 4;
    },

    /// 基础函数 - 获取一个点周围的点坐标
    getRound:function (x, y){
        return [cc.p(x + 0, y + 1),// 上
                cc.p(x + 1, y + 1 - x % 2),// 右上
                cc.p(x + 1, y + 0 - x % 2),// 右下
                cc.p(x + 0, y - 1),// 下
                cc.p(x - 1, y + 1 - x % 2),// 左上
                cc.p(x - 1, y + 0 - x % 2)];// 左下
    },
    
    /// 基础函数 - 将一个像素坐标点转为六边形地图坐标
    toHexagonLoc:function(loc){
        loc = loc || this.selected.getPosition();
        var x = parseInt((loc.x + 3 - this.TiledOffset) / this.XSpacing);
        var y = parseInt((loc.y + 3 - (x + 1) % 2 * this.TiledOffset) / this.TiledSize);
        return cc.p(x, y);
    },
    
    /// 基础函数 - 将一个六边形地图坐标转为像素坐标点
    toPixelLoc:function(x, y){
        return cc.p(x * this.XSpacing + this.TiledOffset, y * this.TiledSize + (x + 1) % 2 * this.TiledOffset);
    },
});
