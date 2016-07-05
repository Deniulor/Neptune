var MapTiled = cc.Class({

    ctor:function(){
        this.TiledSize = 100; //单个地格大小
        this.MapWidth = 13; //地图宽度
        this.MapHeight = 4; //地图高度
        this.TiledOffset = this.TiledSize / 2;
        this.XSpacing = this.TiledSize * 3 / 4;

    },


    /// 基础函数 - 将一个像素坐标点转为六边形地图坐标
    toHexagonLoc:function(loc){
        var x = parseInt((loc.x + 3 - this.TiledSize / 4) / this.XSpacing);
        var y = (loc.y + 3 - (x + 1) % 2 * this.TiledOffset) / this.TiledSize;
        y = parseInt(y < 0 ? y - 1:y);
        return cc.p(x, y);
    },
    
    /// 基础函数 - 将一个六边形地图坐标转为像素坐标点
    toPixelLoc:function(x, y){
        return cc.p(x * this.XSpacing + this.TiledOffset, y * this.TiledSize + (x + 1) % 2 * this.TiledOffset);
    },

    randHexagonLoc:function(invalid){
        var x = Math.floor(Math.random() * this.MapWidth);
        var y = Math.floor(Math.random() * this.MapHeight);
        return this.getNearOne(cc.p(x, y), invalid);
    },

    randPixelLoc:function(invalid){
        var loc = this.randHexagonLoc(invalid);
        return this.toPixelLoc(loc.x, loc.y);
    },

    /// 基础函数 - 获取一个点周围的点坐标
    isLocValid:function (r){
        if(!r) return false;
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
    
    getArea:function(from, distance, filter){
        var searched = [];
        var self = this;
        
        var node = function(loc_x, log_y, distance){
            this.x = loc_x;
            this.y = log_y;
            this.distance = distance;
        };
        
        var dfs = function(curnode){
            var d = curnode.distance + 1;
            if(d > distance){
                return;
            }
            var round = self.getRound(curnode.x, curnode.y);
            for(var i = round.length - 1; i >= 0; i -- ){
                var r = round[i];
                if(!self.isLocValid(r)){ //坐标是否有效
                    continue;
                }
                if(filter && filter(r.x, r.y)){
                    continue;
                }
                var nodeInSearched = self.search(searched, r.x, r.y);
                if(nodeInSearched === null){
                    searched.push(new node(r.x, r.y, d));
                } else if(nodeInSearched.distance > d){
                    nodeInSearched.distance = d;
                }
                dfs(new node(r.x, r.y, d));
            }
        }
        
        dfs(new node(from.x, from.y, 0));
        return searched;
    },

    getNearOne:function(from, invalid){
        if(!invalid || !invalid(from.x, from.y)){
            return from;
        }
        var node = function(p_parent, loc_x, log_y, g){
            this.parent = p_parent;
            this.x = loc_x;
            this.y = log_y;
            this.valueG = g;
            this.valueH = 0;
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
            var round = this.getRound(curnode.x, curnode.y);
            for(var i = round.length - 1; i >= 0; i -- ){
                var r = round[i];
                if(!this.isLocValid(r)){ // 越界
                    continue;
                }
                if(!invalid(r.x, r.y)){
                    return r;
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


module.exports = new MapTiled();