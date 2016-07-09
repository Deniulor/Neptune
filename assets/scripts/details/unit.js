var dataApi = require('dataApi');
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
        var url = cc.url.raw('resources/graphics/dic/' + data.icon + '.png');
        this.node.getChildByName('pic').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(url); 
        this.node.getChildByName('name').getComponent(cc.Label).string = this.name;
        this.node.getChildByName('hp').getComponent(cc.Label).string = "血量" + this.MaxHP;
        this.node.getChildByName('atk').getComponent(cc.Label).string = "攻击" + this.Atk;
        this.node.getChildByName('move').getComponent(cc.Label).string = "移动范围" + this.Mov;
        this.node.getChildByName('rng').getComponent(cc.Label).string = "攻击范围" + this.Rng;
        this.node.getChildByName('atb').getComponent(cc.Label).string = "速度" + this.Atb;
        this.node.getChildByName('instruction').getComponent(cc.Label).string = data.instruction;
        this.node.setPosition(loc);
        for(var i = 1; i<=3 ; ++i){
            var skl = data['skill_' + i];
            if(!skl){
                continue;
            }
            skl = dataApi.skills.findById(skl);
            if(!skl){
                continue;
            }
            this.initSkill('skill_' + i,skl);
        }
    },
    initSkill:function (childName,skill) {
        var url = cc.url.raw('resources/graphics/skill/' + skill.icon + '.png');
        this.node.getChildByName(childName).active = true;
        this.node.getChildByName(childName).getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(url); 
        this.node.getChildByName(childName).getChildByName('description').getComponent(cc.Label).string = skill.desc;
},
    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
