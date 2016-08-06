var showMessage = require('showMessage');
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
        skillPrefab: {
            default: null,
            type: cc.Prefab
        },
        setupPrefab: {
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
        skillTip: {
            default: null,
            type: cc.Label
        },
        unitTip:{
            default: null,
            type: cc.Node
        },
        playerIcon: {
            default: null,
            type: cc.Node
        },
        playerName: {
            default: null,
            type: cc.Label
        },
    },
    
    // 加载事件
    onLoad: function () {
        var self = this;
        self.creatures = self.node.getChildByName('creatures');
        
        // 放置单位
        self.initBattle();
        self.node.on('touchstart', self.onTouchStart, self);
        self.node.on("touchend", self.onTouchEnded, self);
        // self.node.on('touchmove',this.onTouchcancel,this);
        // this.node.on('touchend',this.stopLongTouch, this);
        self.node.on('touchcancel',this.onTouchcancel, this);
        cc.audioEngine.stopMusic();
        this.soundID = cc.audioEngine.playMusic(this.battleMusic, true);
        this.stopUpdate = true;
        // this.floatMessage("32313");
        this.setSelected(null);
        cc.director.preloadScene('menu');
        // var loc = cc.Vec2(0,20);
        var temp = this.node.convertToNodeSpace(cc.v2(0,20));
        this.unitTip.setPosition(temp);
        cc.log(this.unitTip.getPosition());
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
    onTouchStart: function (event) {
        var self = this;
        var loc = event.getLocation();
        var temp = this.node.convertToNodeSpace(loc);
        loc = npt.tiled.toHexagonLoc(temp);
        let node = this.getCreatureOn(loc.x, loc.y);
        let creature = node ? node.getComponent('creature') : null;
        if(creature!=null){
        this.touching = setTimeout(function (){
            self.showUnitDetail(creature.data);
        }, 1000);
        }
    },
    onTouchcancel: function (event) {
        if(this.unitTip.active){
           this.unitTip.active = false; 
        }
    },
    // 点击结束事件
    onTouchEnded:function(event){
        if(this.skillTip.node.active){
           this.skillTip.node.active = false; 
        }
        if(this.unitTip.active){
           this.unitTip.active = false; 
        }
        if(!this.selected){
            return;
        }
        var loc = event.getLocation();
        var temp = this.node.convertToNodeSpace(loc);
        loc = npt.tiled.toHexagonLoc(temp);
        // cc.log('touch hexagonLoc(%s,%s) at (%s,%s)',loc.x, loc.y, temp.x, temp.y);
        if(!npt.tiled.isLocValid(loc)){ // 在可操作区域内
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
            if(creature !== null && creature.HP > 0){
                this.selected.getComponent('creature').attack(creature);
                return;
            }
        }
    },
    
    initBattle:function(){
        // 初始化单位列表
        this.creatures.removeAllChildren();
        npt.battle.comp = this;
        for(var i = npt.battle.all.length - 1; i >= 0; --i){
            var creature = npt.battle.all[i];
            this.creatures.addChild(creature);
        }
    },

    addCreature:function(creature){
        this.creatures.addChild(creature);
        this.node.getChildByName('atbBar').getComponent('atbBar').addCreature(creature);
    },
    removeCreature:function(creature){
        this.creatures.removeChild(creature);
        this.node.getChildByName('atbBar').getComponent('atbBar').removeCreature(creature);
    },
    // 浮动弹窗    
    floatMessage:function (message) {
        showMessage.init(this.node,message);
    },
    /// 基础函数 - 获取六边形坐标点x，y的上的单位，无则返回空
    getCreatureOn:function(x, y){
        for(var i = this.creatures.children.length - 1; i >= 0; --i){
            var child = this.creatures.children[i];
            var loc = npt.tiled.toHexagonLoc(child.getPosition());
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
        for(var i = npt.tiled.MapHeight - 1; i >=0 ; --i){
            for(var j = npt.tiled.MapWidth - 1; j >=0; --j){
                this.funcLayer.setTileGID(0, cc.p(j, i));
            }
        }
    },
    
    /// 基础函数 设置当前单位
    setSelected:function(creature){
        if(this.selected){
            this.selected.getChildByName('creature').getChildByName('selected').active = false;
        }
        this.selected = creature;
        if(this.selected){
            this.stopUpdate = false;
            this.selected.getChildByName('creature').getChildByName('selected').active = true;
            var c = this.selected.getComponent('creature');
            if(c.camp == 'red'){
                this.playerIcon.color = cc.color(230, 140, 140);
                this.playerName = "红方玩家";
            } else { // 
                this.playerIcon.color = cc.color(110, 150, 240);
                this.playerName = "蓝方玩家";
            } 
            c.onTurnBegin();
            var creaturePanel = this.node.getChildByName('creature');
            c.showCreature(creaturePanel);
            creaturePanel.active = true;
        } else {
            this.node.getChildByName('creature').active = false;
            this.playerIcon.color = cc.color(255, 255, 255);
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
    },

    puase:function(){
        if(this.setupWindow){
            this.setupWindow.active = true;
        } else {
            this.setupWindow = cc.instantiate(this.setupPrefab);
            this.node.parent.addChild(this.setupWindow);
        }
    },

    showSkillDetail:function(skill){
        this.skillTip.node.active = true;
        this.skillTip.node.setPositionX(50);
        this.skillTip.node.setPositionY(20);
        this.skillTip.string = skill.data.desc;
        cc.log("detail:",skill);
    },
    showUnitDetail:function(data){
        this.unitTip.active = true;
        this.unitTip.setPositionX(50);
        this.unitTip.setPositionY(20);
        var MaxHP = data.hp;
        var Mov = data.mov;
        var Rng = data.rng;
        var Atb = data.atb;
        var Atk = data.atk;
        this.unitTip.getChildByName('lb_hp').getChildByName('lb_number').getComponent(cc.Label).string = MaxHP;
        this.unitTip.getChildByName('lb_hurt').getChildByName('lb_number').getComponent(cc.Label).string = Atk;
        this.unitTip.getChildByName('lb_move').getChildByName('lb_number').getComponent(cc.Label).string =Mov;
        this.unitTip.getChildByName('lb_rng').getChildByName('lb_number').getComponent(cc.Label).string =Rng;
        this.unitTip.getChildByName('lb_speed').getChildByName('lb_number').getComponent(cc.Label).string =Atb;
        // cc.log("detail:",skill);
    },
    hideSkillDetail:function(){
        this.skillTip.node.active = false;
    },
    hideUnitDetail:function(){
        this.unitTip.active = false;
    },
});