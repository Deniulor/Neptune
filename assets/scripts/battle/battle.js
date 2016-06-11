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
        battleMusic: {
            default: null,
            url: cc.AudioClip
        },
        attackEffect: {
            default: null,
            url: cc.AudioClip
        },
        nomalAttack: {
            default: null,
            url: cc.AudioClip
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
        cc.audioEngine.stopMusic();
        this.soundID = cc.audioEngine.playMusic(this.battleMusic, true);
        cc.audioEngine.setMusicVolume(0.5);
        cc.audioEngine.setEffectsVolume(0.5);
        this.stopUpdate = true;
    },
    
    update:function(){
        if(this.stopUpdate){
            return;
        }
        this.clearFuncLayer();
        if(this.selected !== null){
            this.selected.getComponent('creature').showAction();
        }
    },
    
    // 点击结束事件
    onTouchEnded:function(event){
        if(!this.selected){
            return;
        }
        var loc = event.getLocation();
        var temp = this.node.convertToNodeSpace(loc);
        loc = this.tiled.toHexagonLoc(temp);
        //cc.log('touch hexagonLoc(%s,%s) at (%s,%s)',loc.x, loc.y, temp.x, temp.y);
        if(!this.tiled.isLocValid(loc)){ // 在可操作区域内
            return;
        }
        var action = this.funcLayer.getTileGIDAt(loc.x, 3 - loc.y);
        if( action === 0){
            return; // 点击到非功能区
        }
        
        var AreaMove = 4, AreaAttack = 5;
        if(action == AreaMove){
            this.moveto(loc.x, loc.y);
            return;
        }

        if(action == AreaAttack){
            let node = this.getCreatureOn(loc.x, loc.y);
            let creature = node ? node.getComponent('creature') : null;
            if(creature !== null && creature.HP > 0 && creature.camp != this.selected.getComponent('creature').camp){
                this.attack(node);
                return;
            }
        }
    },
    
    initBattle:function(){
        // 初始化单位列表
        this.creatures.removeAllChildren();
        
        var dataApi = require('dataApi');
        
        // 使用给定的模板在场景中生成一个新节点
        var knight1 = cc.instantiate(this.creaturePrefab);
        knight1.getComponent('creature').init(this, 'player1', dataApi.creatures.random(), this.tiled.randPixelLoc());
        this.creatures.addChild(knight1);
        
        var knight2 = cc.instantiate(this.creaturePrefab);
        knight2.getComponent('creature').init(this, 'player1', dataApi.creatures.random(), this.tiled.randPixelLoc());
        this.creatures.addChild(knight2);

        var archer2 = cc.instantiate(this.creaturePrefab);
        archer2.getComponent('creature').init(this, 'player2', dataApi.creatures.random(), this.tiled.randPixelLoc());
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
    
    /// 基础函数 设置当前单位
    setSelected:function(creature){
        if(this.selected){
            this.selected.getChildByName('Selected').active = false;
        }
        this.selected = creature;
        if(this.selected){
            this.stopUpdate = false;
            this.selected.getChildByName('Selected').active = true;
            this.selected.getComponent('creature').action = 'move';
            var player = this.selected.getComponent('creature').camp;
            this.node.getChildByName(player).getComponent('player').skillUsed = false;
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
        var dogMove = [];
                
        if(this.selected.getComponent('creature').type=="dog"){
            dogMove.push(cc.fadeOut(0.5));
            for(var i = 0; i < path.length; ++i){
            dogMove.push(path[i]);
            }
            dogMove.push(cc.fadeIn(0.5));
            dogMove.push(cc.callFunc(function(){
                self.selected.getComponent('creature').action = 'attack';
            }));
            this.selected.runAction(cc.sequence(dogMove));
            // this.selected.runAction(cc.sequence(path));
        }else{
            path.push(cc.callFunc(function(){ 
                self.selected.getComponent('creature').action = 'attack';
            }));
            this.selected.runAction(cc.sequence(path));
        }
        this.selected.getComponent('creature').action = 'moving';
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
        if(this.selected.getComponent('creature').type=="dog"){
            seq.push(cc.callFunc(function(){
                        cc.audioEngine.playEffect(this.attackEffect, false);
                    },this));
        }else{
            seq.push(cc.callFunc(function(){
                        cc.audioEngine.playEffect(this.nomalAttack, false);
                    },this));
        }
        var attackAct = [];
        var jump = cc.jumpBy(0.5, targetLoc.x - distLoc.x, targetLoc.y - distLoc.y, 20, 1);
        attackAct.push(jump);
        var atk = cc.spawn(cc.sequence(cc.rotateBy(0.1, 10, 10),cc.rotateBy(0.1, -10, -10),cc.rotateBy(0.1, 10, 10),cc.rotateBy(0.1, -10, -10)));
        attackAct.push(atk);
        attackAct.push(cc.moveBy(0.5, cc.p(distLoc.x - targetLoc.x, distLoc.y - targetLoc.y)));
        
        attackAct.push(cc.callFunc(function(){
            target.getComponent('creature').runDamageAction();
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
        var slctd = this.selected;
        
        target.getComponent('creature').onDamage(30);
        
        var dogMove = [];
        if(this.selected.getComponent('creature').type=="dog"){
            dogMove.push(cc.fadeOut(0.5)); 
            dogMove.push(cc.callFunc(function(){ 
                slctd.setPosition(cc.p(distLoc.x, distLoc.y));
            }));
            dogMove.push(cc.fadeIn(0.5));
            dogMove.push(cc.callFunc(function(){
                if(actor) {
                    actor.runAction(cc.sequence(attackAct));
                }
            }));
            this.selected.runAction(cc.sequence(dogMove));
        }else{
            this.selected.runAction(cc.sequence(seq));
        }
        this.selected.getComponent('creature').turnEnd();
        this.setSelected(null);
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
            this.node.getChildByName('atbBar').getComponent('atbBar').stop = true;
            this.stopUpdate = true;
            this.clearFuncLayer();
            
            // 使用给定的模板创建winner界面
            var winner = cc.instantiate(this.winnerPrefab);
            winner.getComponent('winner').setWinner(w);
            this.node.parent.parent.addChild(winner);
            cc.audioEngine.stopMusic();
        } 
    }
});