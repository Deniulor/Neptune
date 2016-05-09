cc.Class({
    extends: cc.Component,
    
    properties: {
        field: {
            default: null,
            type: cc.TiledMap
        },
        funcLayer: {
            default: null,
            type: cc.TiledLayer
        },
        creaturePrefab: {
            default: null,
            type: cc.Prefab
        },
    },
    
    // 加载事件
    onLoad: function () {
        var self = this;
        self.tiled = self.getComponent('battleTiled');
        self.creatures = self.node.getChildByName('creatures');
        self.clearFuncLayer();
        
        // 放置单位
        self.putonCreatures();
        self.node.on("touchend", self.onTouchEnded, self);
    },
    
    
    // 点击结束事件
    onTouchEnded:function(event){
        if(!this.selected){
            return;
        }
        var loc = event.getLocation();
        loc = this.node.convertToNodeSpace(loc);
        loc = this.tiled.toHexagonLoc(loc);
        if(!this.tiled.isLocValid(loc)){ // 在可操作区域内
            return;
        }
        var action = this.funcLayer.getTileGIDAt(loc.x, 3 - loc.y);
        if( action === 0){
            return; // 点击到非功能区
        }

        if(action == 4){
            cc.log('moveto');
            this.selected = null;
            this.clearFuncLayer();
            return;
        }

        var targetCreature = this.getCreatureOn(x,y).getComponent('creature');
        if(action == 5 && !targetCreature.isDead && targetCreature.camp != this.selected.getComponent('creature').camp){
            cc.log('attackto');
            this.selected = null;
            this.clearFuncLayer();
            return;
        }
    },
    
    putonCreatures:function(){
        var url1 = cc.url.raw('resources/graphics/creature/creature1.png');
        var c1 = new cc.SpriteFrame(url1, cc.Rect(0, 0, 329, 337));
        
        // 使用给定的模板在场景中生成一个新节点
        var knight1 = cc.instantiate(this.creaturePrefab);
        knight1.getComponent('creature').init("Knight", 3, 100, 3, 1);
        knight1.setPosition(this.tiled.toPixelLoc(0, 0));
        knight1.getComponent(cc.Sprite).spriteFrame = c1;
        this.creatures.addChild(knight1);
        
        var knight2 = cc.instantiate(this.creaturePrefab);
        knight2.getComponent('creature').init("Knight", 3, 100, 3, 1);
        knight2.setPosition(this.tiled.toPixelLoc(0, 2));
        knight2.getComponent(cc.Sprite).spriteFrame = c1;
        this.creatures.addChild(knight2);
        
        
        var url2 = cc.url.raw('resources/graphics/creature/creature2.png');
        var c2 = new cc.SpriteFrame(url2, cc.Rect(0, 0, 329, 337));
        
        var archer1 = cc.instantiate(this.creaturePrefab);
        archer1.getComponent('creature').init("Archer", 3.5, 100, 2, 3);
        archer1.setPosition(this.tiled.toPixelLoc(12, 3));
        archer1.getComponent(cc.Sprite).spriteFrame = c2;
        this.creatures.addChild(archer1);
        
        var archer2 = cc.instantiate(this.creaturePrefab);
        archer2.getComponent('creature').init("Archer", 3.5, 100, 2, 3);
        archer2.setPosition(this.tiled.toPixelLoc(12, 1));
        archer2.getComponent(cc.Sprite).spriteFrame = c2;
        this.creatures.addChild(archer2);
    },
    
    /// 基础函数 - 获取六边形坐标点x，y的上的单位，无则返回空
    getCreatureOn:function(x, y){
        var from = this.tiled.toPixelLoc(x, y);
        for(var i = this.creatures.children.length - 1; i >= 0; --i){
            var child = this.creatures.children[i];
            if(child.getPositionX() == from.x && child.getPositionY() == from.y){
                return child;
            }
        }
        return null;
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
    
    /// 辅助函数 清除功能层上的所有信息
    clearFuncLayer:function(){
        for(var i = this.tiled.MapHeight - 1; i >=0 ; --i){
            for(var j = this.tiled.MapWidth - 1; j >=0; --j){
                this.funcLayer.setTileGID(0, cc.p(j, i));
            }
        }
    },
    
    /// 显示选择单位的可移动范围
    showMovable:function(){
        if(!this.selected){
            return;
        }
        var fromCreature = this.selected.getComponent("creature");
        var distance = fromCreature.Mov + fromCreature.Rng;
        var from = this.tiled.toHexagonLoc(this.selected.getPosition());
        
        var node = function(loc_x, log_y, distance){
            this.x = loc_x;
            this.y = log_y;
            this.distance = distance;
        };
        
        var open = [];
        open.push(new node(from.x, from.y, 0));
        var closed = [];
        while(open.length > 0){
            var curnode = open.pop();
            closed.push(curnode);
            if(curnode.distance > fromCreature.Mov){
                this.funcLayer.setTileGID(5, cc.p(curnode.x, 3 - curnode.y));
            } else {
                this.funcLayer.setTileGID(4, cc.p(curnode.x, 3 - curnode.y));
            }
            var u = this.getCreatureOn(curnode.x, curnode.y);
            if(u !== null && u.getComponent("creature").camp != fromCreature.camp){
                this.funcLayer.setTileGID(5, cc.p(curnode.x, 3 - curnode.y));
                continue;//不允许穿敌人
            }
            var d = curnode.distance + 1;
            if(d > distance){
                continue;
            }
            var round = this.tiled.getRound(curnode.x, curnode.y);
            for(var i = round.length - 1; i >= 0; i -- ){
                var r = round[i];
                if(!this.tiled.isLocValid(r)){ //坐标是否有效
                    continue;
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