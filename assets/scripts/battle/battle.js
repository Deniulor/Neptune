var battleTiled = require('battleTiled');
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
        self.creatures = self.node.getChildByName('creatures');
        self.clearFuncLayer();
        
        // 放置单位
        self.initBattle();
        self.node.on("touchend", self.onTouchEnded, self);
        cc.audioEngine.stopMusic();
        cc.audioEngine.setMusicVolume(0.5);
        //this.soundID = cc.audioEngine.playMusic(this.battleMusic, true);
        cc.audioEngine.setEffectsVolume(0.5);
        this.stopUpdate = true;

        this.setSelected(null);
    },
    
    update:function(){
        if(this.stopUpdate){
            return;
        }
        this.clearFuncLayer();
        if(!!this.selected){
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
        loc = battleTiled.toHexagonLoc(temp);
        //cc.log('touch hexagonLoc(%s,%s) at (%s,%s)',loc.x, loc.y, temp.x, temp.y);
        if(!battleTiled.isLocValid(loc)){ // 在可操作区域内
            return;
        }
        var action = this.funcLayer.getTileGIDAt(loc.x, 3 - loc.y);
        if( action === 0){
            return; // 点击到非功能区
        }
        
        var AreaMove = 4, AreaAttack = 5;
        if(action == AreaMove){
            this.selected.getComponent('creature').moveto(loc.x, loc.y);
            return;
        }

        if(action == AreaAttack){
            let node = this.getCreatureOn(loc.x, loc.y);
            let creature = node ? node.getComponent('creature') : null;
            if(creature !== null && creature.HP > 0 && creature.camp != this.selected.getComponent('creature').camp){
                this.selected.getComponent('creature').attack(creature);
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
        knight1.getComponent('creature').init(this, 'red', dataApi.creatures.random(), battleTiled.randPixelLoc());
        this.creatures.addChild(knight1);
        
        var knight2 = cc.instantiate(this.creaturePrefab);
        knight2.getComponent('creature').init(this, 'red', dataApi.creatures.random(), battleTiled.randPixelLoc());
        this.creatures.addChild(knight2);

        var archer2 = cc.instantiate(this.creaturePrefab);
        archer2.getComponent('creature').init(this, 'blue', dataApi.creatures.random(), battleTiled.randPixelLoc());
        this.creatures.addChild(archer2);
    },
    
    /// 基础函数 - 获取六边形坐标点x，y的上的单位，无则返回空
    getCreatureOn:function(x, y){
        for(var i = this.creatures.children.length - 1; i >= 0; --i){
            var child = this.creatures.children[i];
            var loc = battleTiled.toHexagonLoc(child.getPosition());
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
        for(var i = battleTiled.MapHeight - 1; i >=0 ; --i){
            for(var j = battleTiled.MapWidth - 1; j >=0; --j){
                this.funcLayer.setTileGID(0, cc.p(j, i));
            }
        }
    },
    
    /// 基础函数 设置当前单位
    setSelected:function(creature){
        if(this.selected){
            this.selected.getChildByName('Sprite').getChildByName('Selected').active = false;
        }
        this.selected = creature;
        if(this.selected){
            this.stopUpdate = false;
            this.selected.getChildByName('Sprite').getChildByName('Selected').active = true;
            var c = this.selected.getComponent('creature');
            c.action = 'move';
            
            var creaturePanel = this.node.getChildByName('creature');
            c.showCreature(creaturePanel);
            creaturePanel.active = true;
        } else {
            this.node.getChildByName('creature').active = false;
        }
    },
    
    checkIfWinner:function(){
        var red = 0;
        var blue = 0;
        for(var i = 0; i < this.creatures.children.length; ++i){
            var creature = this.creatures.children[i].getComponent('creature');
            if(creature.HP <= 0){
                continue;
            }
            if(creature.camp == 'red' ){
                red ++;
            } else if(creature.camp == 'blue'){
                blue ++;
            }
        }
        if(red <= 0 && blue <= 0){
            cc.log('draw!');
        } else{
            if(red <= 0){
                var w = 'blue';
            } else if(blue <= 0){
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