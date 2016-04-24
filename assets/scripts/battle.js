cc.Class({
    extends: cc.Component,
    
    properties: {
        map: {
            default: null,
            type: cc.TiledMap
        },
        goundLayer: {
            default: null,
            type: cc.TiledLayer
        },
        funcLayer:{
            default: null,
            type: cc.TiledLayer
        },
        debugLayer:{
            default: null,
            type: cc.Node
        },
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

    /// 基础函数 - 获取点x，y的坐标上的单位，无则返回空
    getUnitOn:function(x, y){
        for(var i = this.node.children.length - 1; i >= 0; --i){
            var child = this.node.children[i];
            var from_x = parseInt((child.getPosition().x + 3 - 40) / 60);
            var from_y = parseInt((child.getPosition().y + 3 - (from_x + 1) % 2 * 40) / 80);
            if(x == from_x && y == from_y){
                return child;
            }
        }
        return null;
    },

    /// 基础函数 - 将一个像素坐标点转为六边形地图坐标
    toHexagonLoc:function(loc){
        loc = loc || this.selected.getPosition();
        var x = parseInt((loc.x + 3 - 40) / 60);
        var y = parseInt((loc.y + 3 - (x + 1) % 2 * 40) / 80);
        return cc.p(x, y);
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
                if(r.x < 0 || r.x >= 15 // x 越界
                    || r.y < 0 || r.y >= 7){ //y 越界
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

    // 加载事件
    onLoad: function () {
        var self = this;
        cc.eventManager.addListener({
            event:cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function(){ return true; },
            onTouchMoved: function(){},
            onTouchEnded: function(touch, event){
                self.onTouchEnded(touch, event);
            },
        }, self.node);
        
        for(var x = 0; x < 15; ++x){
            for(var y = 0;y < 7; ++y){
                let node = new cc.Node();
                let label = node.addComponent(cc.Label);
                label.fontSize = 15;
                label.lineHeight = 15;
                label.string = cc.js.formatStr("( %s, %s )",x,y);
                node.position = cc.p(x * 60 + 40, y * 80 + (x + 1) % 2 * 40);
                this.debugLayer.addChild(node);
            }
        }
    },

    // 点击结束事件
    onTouchEnded:function(touch, event){
        var loc = touch.getLocation();
        var target = event.getCurrentTarget();// 获取事件所绑定的 target
        loc = target.convertToNodeSpace(loc);
        
        var x = parseInt((loc.x - 10) / 60);
        var y = parseInt((loc.y + (x % 2) * 40) / 80);
        if(x < 0 || x >= 15 // x 越界
            || y < 0 || y >= 7){ //y 越界
            return;
        }
        var touchUnit = this.getUnitOn(x,y);
        
        if(!this.selected){
            // 未选择单位 -> 尝试进行选择单位
            if(touchUnit !== null && touchUnit.getComponent("unit").getATB() <= 0){
                this.selected = touchUnit;
                this.clearFuncLayer();
                this.showMovable();
            }
        } else { // 已经选择了单位
            // 如果是选择了空地
            if(touchUnit === null){
                // 在移动范围内则移动过去
                if(this.funcLayer.getTileGIDAt(x, 6 - y) == 3){
                    this.moveto(x, y);
                }
                // 结束操作
                this.selected = null;
                this.clearFuncLayer();
            } else { //选中了单位
                // 选中己方单位 切换单位
                if(touchUnit.getComponent('unit').camp == this.selected.getComponent('unit').camp){
                    this.selected = touchUnit;
                    this.clearFuncLayer();
                    this.showMovable();
                } else {// 敌方单位
                    if(this.funcLayer.getTileGIDAt(x, 6 - y) == 4){ // 且在攻击范围内
                        this.attack(touchUnit);
                        this.clearFuncLayer();
                    } else {
                        this.selected = touchUnit;
                        this.clearFuncLayer();
                        this.showMovable();
                    }
                }
            }
        }
    },

    // 将已选择的单位移动到相应点
    moveto:function(to_x, to_y){
        var from = this.toHexagonLoc();
        var self = this;
        var path = this.getPath(from, cc.p(to_x,to_y), function(x, y){
            var tileGid = self.goundLayer.getTileGIDAt(x, 6 - y);
            //var prop = this.map.getPropertiesForGID(tileGid);
            //if(prop.collidable != "true"){
            if(tileGid != 1){
                return true; // 不可行动点
            }
            var unit = self.getUnitOn(x, y);
            if(unit !== null && unit != self.selected){
                true; // 不允许穿人
            }
        });
        if(!path || path.length <= 0){
            cc.log("没有找到出路");
            return;
        }
        for(var i = 0; i < path.length; ++i){
            path[i] = cc.moveTo(0.05, path[i].x * 60 + 40, path[i].y * 80 + (path[i].x + 1) % 2 * 40); 
        }
        this.selected.getComponent('unit').onMoved();
        this.selected.runAction(cc.sequence(path));
    },
    
    // 用已选择单位攻击指定的单位
    attack:function(target){
        var from = this.toHexagonLoc(this.selected.getPosition());
        var to = this.toHexagonLoc(target.getPosition());
        
        var self = this;
        var path = this.getPath(from, to, function(x, y){
            var tileGid = self.goundLayer.getTileGIDAt(x, 6 - y);
            //var prop = this.map.getPropertiesForGID(tileGid);
            //if(prop.collidable != "true"){
            if(tileGid != 1){
                return true; // 不可行动点
            }
            var unit = self.getUnitOn(x, y);
            if(unit !== null && unit != self.selected){
                true; // 不允许穿人
            }
        });
        
        do{
            var p = path.pop();
        } while(this.funcLayer.getTileGIDAt(p.x, 6 - p.y) == 4);
        
        for(var i = 0; i < path.length; ++i){
            path[i] = cc.moveTo(0.05, path[i].x * 60 + 40, path[i].y * 80 + (path[i].x + 1) % 2 * 40); 
        }
        path.push(cc.moveTo(0.05, p.x * 60 + 40, p.y * 80 + (p.x + 1) % 2 * 40));
        
        var jump = cc.jumpTo(0.5,to.x * 60 + 40,to.y * 80 + (to.x + 1) % 2 * 40,30,1);
        path.push(jump);
        var atk = cc.spawn(cc.sequence(cc.rotateBy(0.1,10,10),cc.rotateBy(0.1,-10,-10),cc.rotateBy(0.1,10,10),cc.rotateBy(0.1,-10,-10)));
        path.push(atk);
        path.push(cc.moveTo(0.5, p.x * 60 + 40, p.y * 80 + (p.x + 1) % 2 * 40));
        if(this.selected.zIndex != target.zIndex){
            let max = Math.max(this.selected.zIndex, target.zIndex);
            let min = Math.min(this.selected.zIndex, target.zIndex);
            this.selected.zIndex = max;
            target.zIndex = min;
        } else {
            this.selected.zIndex ++;
        }
        path.push(cc.callFunc(function(){
            target.getComponent('unit').onDamage(30)
        }));
        this.selected.getComponent('unit').onMoved();
        this.selected.runAction(cc.sequence(path));
    },

    /// 辅助函数 清除功能层上的所有信息
    clearFuncLayer:function(){
        for(var i = 6; i >=0 ; --i){
            for(var j = 14; j >=0; --j){
                this.funcLayer.setTileGID(0, cc.p(j, i));
            }
        }
    },
    
    /// 显示选择单位的可移动范围
    showMovable:function(){
        var from = this.selected;
        var fromUnit = from.getComponent("unit");
        var distance = fromUnit.Mov + fromUnit.Rng;
        var from_x = parseInt((from.getPosition().x + 3 - 40) / 60);
        var from_y = parseInt((from.getPosition().y + 3 - (from_x + 1) % 2 * 40) / 80);
        
        var node = function(loc_x, log_y, distance){
            this.x = loc_x;
            this.y = log_y;
            this.distance = distance;
        };
        
        var open = [];
        open.push(new node(from_x, from_y, 0));
        var closed = [];
        while(open.length > 0){
            var curnode = open.pop();
            closed.push(curnode);
            if(curnode.distance > fromUnit.Mov){
                this.funcLayer.setTileGID(4, cc.p(curnode.x, 6 - curnode.y));
            } else {
                this.funcLayer.setTileGID(3, cc.p(curnode.x, 6 - curnode.y));
            }
            var u = this.getUnitOn(curnode.x, curnode.y);
            if(u !== null && u.getComponent("unit").camp != fromUnit.camp){
                this.funcLayer.setTileGID(4, cc.p(curnode.x, 6 - curnode.y));
                continue;//不允许穿敌人
            }
            var d = curnode.distance + 1;
            if(d > distance){
                continue;
            }
            var round = this.getRound(curnode.x, curnode.y);
            for(var i = round.length - 1; i >= 0; i -- ){
                var r = round[i];
                if(r.x < 0 || r.x >= 15 // x 越界
                    || r.y < 0 || r.y >= 7){ //y 越界
                    continue;
                }
                var tileGid = this.goundLayer.getTileGIDAt(r.x, 6 - r.y);
                if(tileGid != 1){
                    continue; // 不可行动点
                }
                if(this.search(closed, r.x, r.y) !== null){
                    continue; // 已经遍历过了
                }
                var nodeInOpen = this.search(open, r.x, r.y);
                if(nodeInOpen === null){
                    open.push(new node(r.x, r.y, d));
                } else {
                    if(nodeInOpen.distance > d){
                        nodeInOpen.distance = d;
                    }
                }
            }
        }
    },
});
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
