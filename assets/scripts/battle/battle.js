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
        winnerPrefab:{
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
        self.initBattle();
        self.node.on("touchend", self.onTouchEnded, self);
    },
    
    
    // 点击结束事件
    onTouchEnded:function(event){
        if(!this.selected){
            return;
        }
        var loc = event.getLocation();
        var temp = this.node.convertToNodeSpace(loc);
        loc = this.tiled.toHexagonLoc(temp);
        cc.log('touch hexagonLoc(%s,%s) at (%s,%s)',loc.x, loc.y, temp.x, temp.y);
        if(!this.tiled.isLocValid(loc)){ // 在可操作区域内
            return;
        }
        var action = this.funcLayer.getTileGIDAt(loc.x, 3 - loc.y);
        if( action === 0){
            return; // 点击到非功能区
        }

        if(action == 4){
            this.moveto(loc.x, loc.y);
            this.selected = null;
            this.clearFuncLayer();
            return;
        }

        if(action == 5){
            let node = this.getCreatureOn(loc.x, loc.y);
            let creature = node ? node.getComponent('creature') : null;
            if(creature !== null && creature.HP > 0 && creature.camp != this.selected.getComponent('creature').camp){
                this.attack(node);
                this.selected = null;
                this.clearFuncLayer();
                return;
            }
        }
    },
    
    initBattle:function(){
        // 初始化单位列表
        this.creatures.removeAllChildren();
        
        var url1 = cc.url.raw('resources/graphics/creature/creature1.png');
        var c1 = new cc.SpriteFrame(url1);
        
        // 使用给定的模板在场景中生成一个新节点
        var knight1 = cc.instantiate(this.creaturePrefab);
        knight1.getComponent('creature').init("player1", 3, 50, 3, 1);
        knight1.getComponent('creature').battle = this;
        knight1.setPosition(this.tiled.toPixelLoc(0, 0));
        knight1.getChildByName('Sprite').getComponent(cc.Sprite).spriteFrame = c1;
        this.creatures.addChild(knight1);
        
        var knight2 = cc.instantiate(this.creaturePrefab);
        knight2.getComponent('creature').init("player1", 2, 50, 3, 1);
        knight2.getComponent('creature').battle = this;
        knight2.setPosition(this.tiled.toPixelLoc(4, 2));
        knight2.getChildByName('Sprite').getComponent(cc.Sprite).spriteFrame = c1;
        this.creatures.addChild(knight2);
        
        
        var url2 = cc.url.raw('resources/graphics/creature/creature2.png');
        var c2 = new cc.SpriteFrame(url2);
        
        // var archer1 = cc.instantiate(this.creaturePrefab);
        // archer1.getComponent('creature').init("player2", 3.5, 10, 2, 3);
        // archer1.getComponent('creature').battle = this;
        // archer1.setPosition(this.tiled.toPixelLoc(12, 3));
        // archer1.getChildByName('Sprite').getComponent(cc.Sprite).spriteFrame = c2;
        // this.creatures.addChild(archer1);
        
        var archer2 = cc.instantiate(this.creaturePrefab);
        archer2.getComponent('creature').init("player2", 3.5, 50, 2, 3);
        archer2.getComponent('creature').battle = this;
        archer2.setPosition(this.tiled.toPixelLoc(7, 2));
        archer2.getChildByName('Sprite').getComponent(cc.Sprite).spriteFrame = c2;
        this.creatures.addChild(archer2);
        
        
    },
    
    /// 基础函数 - 获取六边形坐标点x，y的上的单位，无则返回空
    getCreatureOn:function(x, y){
        for(var i = this.creatures.children.length - 1; i >= 0; --i){
            var child = this.creatures.children[i];
            var loc = this.tiled.toHexagonLoc(child.getPosition());
            if(loc.x == x && loc.y == y){
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
        var self = this;
        
        var fromCreature = this.selected.getComponent("creature");
        var distance = fromCreature.Mov + fromCreature.Rng;
        var from = this.tiled.toHexagonLoc(this.selected.getPosition());
        
        var node = function(loc_x, log_y, distance){
            this.x = loc_x;
            this.y = log_y;
            this.distance = distance;
        };
        
        var searched = [];
        
        var idx = 1;
        var dfs = function(curnode){
            var d = curnode.distance + 1;
            if(d > distance){
                return;
            }
            var round = self.tiled.getRound(curnode.x, curnode.y);
            for(var i = round.length - 1; i >= 0; i -- ){
                var r = round[i];
                if(!self.tiled.isLocValid(r)){ //坐标是否有效
                    continue;
                }
                //cc.log('%s:(%s,%s) -> (%s,%s)  d:%s', idx++, curnode.x, curnode.y,  r.x, r.y, d);
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
        
        for(var i = 0; i < searched.length; ++i){
            var curnode = searched[i];
            
            var u = this.getCreatureOn(curnode.x, curnode.y);
            if(u !== null ){
                if(u.getComponent("creature").camp != fromCreature.camp){
                    this.funcLayer.setTileGID(5, cc.p(curnode.x, 3 - curnode.y));
                }
            } else if(curnode.distance > fromCreature.Mov){
                this.funcLayer.setTileGID(5, cc.p(curnode.x, 3 - curnode.y));
            } else {
                this.funcLayer.setTileGID(4, cc.p(curnode.x, 3 - curnode.y));
            }
        }
    },

    // 将已选择的单位移动到相应点
    moveto:function(to_x, to_y){
        var from = this.tiled.toHexagonLoc(this.selected.getPosition());
        var self = this;
        var path = this.tiled.getPath(from, cc.p(to_x,to_y), function(x, y){
            var creature = self.getCreatureOn(x, y);
            if(creature !== null && creature != self.selected){
                true; // 不允许穿人
            }
        });
        if(!path || path.length <= 0){
            cc.log("没有找到出路");
            return;
        }
        for(var i = 0; i < path.length; ++i){
            path[i] = cc.moveTo(0.05, this.tiled.toPixelLoc(path[i].x, path[i].y)); 
        }
        this.selected.getComponent('creature').onMoved();
        this.node.getChildByName('atbBar').getComponent('atbBar').stop = false;
        this.selected.runAction(cc.sequence(path));
    },
    
    // 用已选择单位攻击指定的单位
    attack:function(target){
        var from = this.tiled.toHexagonLoc(this.selected.getPosition());
        var to = this.tiled.toHexagonLoc(target.getPosition());
        
        var self = this;
        var path = this.tiled.getPath(from, to, function(x, y){
            var creature = self.getCreatureOn(x, y);
            if(creature !== null && creature != self.selected){
                true; // 不允许穿人
            }
        });
        
        do{
            var p = path.pop();
        } while(this.funcLayer.getTileGIDAt(p.x, 3 - p.y) == 5);
        
        var seq = [];
        for(var i = 0; i < path.length; ++i){
            seq[i] = cc.moveTo(0.05, this.tiled.toPixelLoc(path[i].x, path[i].y)); 
        }
        seq.push(cc.moveTo(0.05, this.tiled.toPixelLoc(p.x, p.y)));
        
        var distLoc = this.tiled.toPixelLoc(p.x, p.y);
        var targetLoc = this.tiled.toPixelLoc(to.x, to.y);
        
        var attackAct = [];
        var jump = cc.jumpBy(0.5, targetLoc.x - distLoc.x, targetLoc.y - distLoc.y, 20, 1);
        attackAct.push(jump);
        
        
        var atk = cc.spawn(cc.sequence(cc.rotateBy(0.1, 10, 10),cc.rotateBy(0.1, -10, -10),cc.rotateBy(0.1, 10, 10),cc.rotateBy(0.1, -10, -10)));
        attackAct.push(atk);
        attackAct.push(cc.moveBy(0.5, cc.p(distLoc.x - targetLoc.x, distLoc.y - targetLoc.y)));
        
        attackAct.push(cc.callFunc(function(){
            target.getComponent('creature').onDamage(30);
        }));
        
        var actor = this.selected.getChildByName('Sprite');
        seq.push(cc.callFunc(function(){
            if(actor) {
                actor.runAction(cc.sequence(attackAct));
            }
        }));
        
        if(this.selected.zIndex != target.zIndex){
            let max = Math.max(this.selected.zIndex, target.zIndex);
            let min = Math.min(this.selected.zIndex, target.zIndex);
            this.selected.zIndex = max;
            target.zIndex = min;
        } else {
            this.selected.zIndex ++; 
        }
        this.selected.getComponent('creature').onMoved();
        this.node.getChildByName('atbBar').getComponent('atbBar').stop = false;
        this.selected.runAction(cc.sequence(seq));
    },
    
    checkIfWinner:function(){
        var player1 = 0;
        var player2 = 0;
        for(var i = 0; i < this.creatures.children.length; ++i){
            var creature = this.creatures.children[i].getComponent('creature');
            if(creature.HP <= 0){
                continue;
            }
            if(creature.camp == 'player1' ){
                player1 ++;
            } else if(creature.camp == 'player2'){
                player2 ++;
            }
        }
        if(player1 <= 0 && player2 <= 0){
            cc.log('draw!');
        } else{
            if(player1 <= 0){
                var w = 'blue';
            } else if(player2 <= 0){
                var w = 'red';
            } else {
                return;
            }
            
            // 使用给定的模板创建winner界面
            var winner = cc.instantiate(this.winnerPrefab);
            winner.getComponent('winner').setWinner(w);
            this.node.parent.parent.addChild(winner);
        } 
    }
});