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
    },
    
    init:function(camp="", atb=5, hp=100, mov=3, rng=1){
        this.camp = camp;
        this.Atb = atb;
        this.MaxHP = hp;
        this.HP = hp;
        this.Mov = mov;
        this.Rng = rng;
        this.curAtb = atb * Math.random() + 0.1;
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
        if(!this.node.getChildByName("HpBar")){
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
        this.node.getChildByName("HpBar").getComponent(cc.ProgressBar).progress = this.showHP / this.MaxHP;
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
        }
        this.curAtb = this.Atb;
    },
    
    change: function(){
        var tnode = this.node;
        tnode.getChildByName("HpBar").removeFromParent();
        cc.loader.loadRes("graphics/creature/skeleton.png/skeleton", function (err, spriteFrame) {
            tnode.getChildByName('Sprite').getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
    }
});
