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

    /// 基础函数 - 将一个像素坐标点转为六边形地图坐标
    toHexagonLoc:function(loc){
        loc = loc || this.selected.getPosition();
        var x = parseInt((loc.x + 3 - this.TiledSize / 4) / this.XSpacing);
        var y = parseInt((loc.y + 3 - (x + 1) % 2 * this.TiledOffset) / this.TiledSize);
        return cc.p(x, y);
    },
    
    /// 基础函数 - 将一个六边形地图坐标转为像素坐标点
    toPixelLoc:function(x, y){
        return cc.p(x * this.XSpacing + this.TiledOffset, y * this.TiledSize + (x + 1) % 2 * this.TiledOffset);
    },

    /// 基础函数 - 获取一个点周围的点坐标
    isLocValid:function (r){
        return r.x >= 0 && r.x < this.MapWidth && r.y >= 0 && r.y < this.MapHeight;
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

    /// 基础函数 - 查询某个数组里面是否含有 px，py坐标的点
    search:function (arr, px, py) {  
        var i = arr.length;  
        while (i--) {
            if (arr[i].x == px && arr[i].y == py) {  
                return arr[i];
            }  
        }  
        return null;  
    },
    
    /// 基础函数 - 获取两个点坐标之间的路径
    getPath:function(from, to, filter){
        var node = function(p_parent, loc_x, log_y, g){
            this.distance = function(){
                var du = Math.abs(this.y - to.y);
                var dv = Math.abs(-Math.ceil(to.y / 2) + to.x + Math.ceil(this.y / 2) - this.x);
                var dw = Math.abs(-to.y + Math.ceil(to.y / 2) - to.x + this.y - Math.ceil(this.y / 2) + this.x);
                return  Math.max(Math.max(du, dv), dw);
            };
            this.parent = p_parent;
            this.x = loc_x;
            this.y = log_y;
            this.valueG = g;
            this.valueH = this.distance();
        };
        
        var open = [];
        open.push(new node(null, from.x, from.y, 0));
        var closed = [];
        while(open.length > 0){
            var n = open.length - 1;
            for(var o = open.length - 2; o >= 0; o -- ){
                if(open[n].valueG + open[n].valueH > open[o].valueG + open[o].valueH){
                    n = o;
                }
            }
            var curnode = open.splice(n, 1)[0];
            closed.push(curnode);
            if(this.search(closed, to.x, to.y) !== null){
                break;
            }
            var round = this.getRound(curnode.x, curnode.y);
            for(var i = round.length - 1; i >= 0; i -- ){
                var r = round[i];
                if(!this.isLocValid(r)){ // 越界
                    continue;
                }
                if(filter && filter(r.x, r.y)){
                    continue;
                }
                if(this.search(closed, r.x, r.y) !== null){
                    continue; // 已经遍历过了
                }
                var nodeInOpen = this.search(open, r.x, r.y);
                var tg = curnode.valueG + 1;
                if(nodeInOpen === null){
                    open.push(new node(curnode, r.x, r.y, tg));
                } else {
                    if(nodeInOpen.valueG > tg){
                        nodeInOpen.valueG = tg;
                        nodeInOpen.parent = curnode;
                    }
                }
            }
        }
        var targetNode = this.search(closed, to.x, to.y);
        var path = [];
        while(targetNode !== null){
            path.push(targetNode);
            targetNode = targetNode.parent;
        }
        path.reverse();
        return path;
    },
});
