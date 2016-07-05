cc.Class({
    extends: cc.Component,

     init:function(data, loc){ 
        this.data = data;
        this.MaxHP = data.hp;
        this.Mov = data.mov;
        this.Rng = data.rng;
        this.Atb = data.atb;
        this.Atk = data.atk;
        this.name = data.name;
        var url = cc.url.raw('resources/graphics/creature/' + data.icon + '.png');
        this.node.getChildByName('pic').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(url); 
        this.node.getChildByName('name').getComponent(cc.Label).String = this.name;
        this.node.getChildByName('hp').getComponent(cc.Label).String = "血量" + this.name;
        this.node.getChildByName('atk').getComponent(cc.Label).String = "攻击" + this.Atk;
        this.node.getChildByName('move').getComponent(cc.Label).String = "移动范围" + this.Mov;
        this.node.getChildByName('rng').getComponent(cc.Label).String = "攻击范围" + this.Rng;
        this.node.getChildByName('atb').getComponent(cc.Label).String = "速度" + this.Atb;
},

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
