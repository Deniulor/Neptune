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
    
    init:function(camp="", atb=5, hp=100, mov=3, rng=1,type=""){
        this.camp = camp;
        this.Atb = atb;
        this.MaxHP = hp;
        this.HP = hp;
        this.Mov = mov;
        this.Rng = rng;
        this.curAtb = atb * Math.random() + 0.1;
        this.showHP = this.HP;
        this.type = type;
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
    
    onMoved: function(){
        this.curAtb = this.Atb;
    },
    
    onDamage: function(damage){
        this.HP -= damage;
        //this.curAtb = this.Atb;
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
