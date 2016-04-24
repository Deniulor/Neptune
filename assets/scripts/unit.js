cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        camp:"",
        ATB:50,
        HP:100,
        Mov:3,//移动力
        Rng:1,//攻击距离
    },

    // use this for initialization
    onLoad: function () {
        this.ATB = this.ATB * 1000;
        this.showHP = this.HP;
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
        this.node.getChildByName("ATB").getComponent(cc.Label).string = str;
        if(this.showHpDuration !== undefined && this.showHpDuration > 0.05){
            this.showHP = this.showHP - (this.showHP - this.HP) / this.showHpDuration * dt;
            this.showHpDuration -= dt;
        }
        if(this.showHP - this.HP < 1){
            this.showHP = this.HP;
        }
        this.node.getChildByName("hpBar").getComponent(cc.ProgressBar).progress = this.showHP / 100;
    },
    
    getATB: function(){
        var atb = (!this.lastActiveTime ? 0 : this.lastActiveTime)  + this.ATB - new Date().getTime();
        return atb < 0 ? 0 :atb / 1000;// 从毫秒转为秒
    },
    
    onMoved: function(){
        this.lastActiveTime = new Date().getTime();
    },
    
    onDamage: function(damage){
        this.HP -= damage;
        this.showHpDuration = this.showHPDuration | 0.5;
        this.showHpDuration += 0.5;
        if(this.HP < 0){
            this.HP = 0;
        }
    }
});
