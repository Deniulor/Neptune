cc.Class({
    extends: cc.Component,

    properties: {
        camp:"",
        Atb:5,
        MaxHP:100,
        HP:100,
        showHP:100,
        Mov:3,//移动力
        Rng:1,//攻击距离
        type:"",//类型
    },
    
    init:function(battle, camp = 'player1', data, loc){  
        this.battle = battle;
        this.camp = camp;

        this.MaxHP = data.hp;
        this.HP = data.hp;
        this.showHP = this.HP;
        this.Mov = data.mov;
        this.Rng = data.rng;
        this.Atb = data.atb;
        this.curAtb = data.atb * Math.random() + 0.1;
        this.type = data.type;

        this.node.setPosition(loc);

        var url = cc.url.raw('resources/graphics/creature/' + data.icon + '.png');
        this.node.getChildByName('Sprite').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(url);
    },

    // use this for initialization
    onLoad: function () {
         
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var atb = this.getATB();
        var str;
        if(atb > 0){
            str = cc.js.formatStr("ATB:%s", atb.toFixed(1));
        }else {
            str = "Ready";
        }
        this.node.getChildByName("Label").getComponent(cc.Label).string = str;
        if(this.showHP >=0 && this.showHpDuration !== undefined && this.showHpDuration > 1e-6){
            this.showHP = this.showHP - (this.showHP - this.HP) / this.showHpDuration * dt;
            this.showHpDuration -= dt;
            if(this.showHP <= 0){
                this.showHP = 0;
                this.showHpDuration = 0;
                var fadeOut = cc.fadeOut(2);
                var finish = cc.callFunc(this.change, this);
                var fadeIn = cc.fadeIn(0.1);
                this.battle.checkIfWinner();
                this.node.runAction(cc.sequence(fadeOut,finish,fadeIn));
                this.icon.runAction(cc.fadeOut(2));
            }
        }
        if(this.showHP - this.HP < 1){
            this.showHP = this.HP;
        }
        this.node.getChildByName("HpBar").getComponent(cc.ProgressBar).progress = this.showHP / this.MaxHP;
    },
    
    getATB: function(){
        return this.curAtb;
    },
    
    turnEnd: function(){
        this.curAtb = this.Atb;
        this.battle.node.getChildByName('atbBar').getComponent('atbBar').stop = false;
    },
    
    showAction:function(){
        if(this.curAtb > 0 ){
            return;
        }
        if(this.action == 'move'){
            this.showMove();
        } else if(this.action == 'attack'){
            this.showAttack();
        }
    },
    
    showMove:function(){
        var self = this;
        var tiled = self.battle.tiled;
        var area = tiled.getArea(tiled.toHexagonLoc(this.node.getPosition()), this.Mov, function(x,y){
            var c = self.battle.getCreatureOn(x,y);
            c = c===null ? null : c.getComponent('creature');
            return c !== null && c !== self && c.HP > 0;
        });
        
        for(var i = 0; i < area.length; ++i){
            var curnode = area[i];
            tiled = self.battle.funcLayer.setTileGID(4, cc.p(curnode.x, 3 - curnode.y));
        }
    },
    
    showAttack:function(){
        var self = this;
        var tiled = self.battle.tiled;
        var hastaget = false;
        
        var area = tiled.getArea(tiled.toHexagonLoc(this.node.getPosition()), this.Rng, function(x,y){
            var c = self.battle.getCreatureOn(x,y);
            c = c===null ? null : c.getComponent('creature');
            hastaget = hastaget ||( c!==null && c.camp != self.camp && c.HP > 0 );
            return c !== null && c.camp == self.camp;
        });
        if(!hastaget){
            this.turnEnd();
            this.battle.setSelected(null);
            return;
        }
        for(var i = 0; i < area.length; ++i){
            var curnode = area[i];
            tiled = self.battle.funcLayer.setTileGID(5, cc.p(curnode.x, 3 - curnode.y));
        }
    },
    
    onDamage: function(damage){
        this.HP -= damage;
    },
    
    runDamageAction:function(){
        this.showHpDuration = this.showHPDuration | 0.5;
        this.showHpDuration += 0.5;
    },
    
    change: function(){
        var tnode = this.node;
        tnode.getChildByName("HpBar").active = false; 
        cc.loader.loadRes("graphics/creature/skeleton", cc.SpriteFrame, function (err, spriteFrame) {
            var sprite = tnode.getChildByName('Sprite');
            sprite.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            sprite.width *= 0.8;
            sprite.height *= 0.8;
        });
    }
});
