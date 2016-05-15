cc.Class({
    extends: cc.Component,

    properties: {
        camp:"",
        Atb:5,
        HP:100,
        Mov:3,//移动力
        Rng:1,//攻击距离
    },
    
    init:function(camp="", atb=5, hp=100, mov=3, rng=1){
        this.camp = camp;
        this.Atb = atb;
        this.HP = hp;
        this.Mov = mov;
        this.Rng = rng;
        this.curAtb = atb * Math.random();
        this.showHP = this.HP;
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
        var childrenCount = this.node.childrenCount;
        if(childrenCount <=0){
            return;
        }
        this.node.getChildByName("Label").getComponent(cc.Label).string = str;
        if(this.showHpDuration !== undefined && this.showHpDuration > 0.05){
            this.showHP = this.showHP - (this.showHP - this.HP) / this.showHpDuration * dt;
            this.showHpDuration -= dt;
        }
        if(this.showHP - this.HP < 1){
            this.showHP = this.HP;
        }
        this.node.getChildByName("HpBar").getComponent(cc.ProgressBar).progress = this.showHP / 100;
    },
    
    getATB: function(){
        return this.curAtb;
    },
    
    onMoved: function(){
        this.curAtb = this.Atb;
    },
    
    onDamage: function(damage){
        this.HP -= damage;
        this.showHpDuration = this.showHPDuration | 0.5;
        this.showHpDuration += 0.5;
        if(this.HP <= 0){
            this.HP = 0;
            var fadeOut = cc.fadeOut(2);
            var finish = cc.callFunc(this.change, this);
            var fadeIn = cc.fadeIn(0.1);
            var checkIfWinner = cc.callFunc(this.battle.checkIfWinner, this.battle);
            this.node.runAction(cc.sequence(fadeOut,finish,fadeIn,checkIfWinner));
            this.node.removeAllChildren();
        }
        this.curAtb = this.Atb;
    },
    
    change: function(){
        var thisSprite = this.node.getComponent(cc.Sprite);
        var tnode = this.node;
        cc.loader.loadRes("graphics/creature/skeleton.png/skeleton", function (err, spriteFrame) {
            thisSprite.spriteFrame = spriteFrame;
        });
    }
});
