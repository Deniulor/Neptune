cc.Class({
    extends: cc.Component,

    init: function (data, loc) {
        this.data = data;
        this.MaxHP = data.hp;
        this.Mov = data.mov;
        this.Rng = data.rng;
        this.Atb = data.atb;
        this.Atk = data.atk;
        this.name = data.name;
        var url = cc.url.raw('resources/graphics/dic/' + data.icon + '.png');
        this.node.getChildByName('nd_monster').getChildByName('pic').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(url);
        this.node.getChildByName('name').getComponent(cc.Label).string = this.name;
        this.node.getChildByName('nd_attribute').getChildByName('lb_hp').getChildByName('lb_number').getComponent(cc.Label).string = this.MaxHP;
        this.node.getChildByName('nd_attribute').getChildByName('lb_hurt').getChildByName('lb_number').getComponent(cc.Label).string = this.Atk;
        this.node.getChildByName('nd_attribute').getChildByName('lb_move').getChildByName('lb_number').getComponent(cc.Label).string = this.Mov;
        this.node.getChildByName('nd_attribute').getChildByName('lb_rng').getChildByName('lb_number').getComponent(cc.Label).string = this.Rng;
        this.node.getChildByName('nd_attribute').getChildByName('lb_speed').getChildByName('lb_number').getComponent(cc.Label).string = this.Atb;
        this.node.getChildByName('nd_monster').getChildByName('details').getComponent(cc.Label).string = data.instruction;
        this.node.setPosition(loc);
        this.hideAllSkill();
        for (var i = 1; i <= 3; ++i) {
            var skl = data['skill_' + i];
            if (!skl) {
                continue;
            }
            skl = npt.data.skills.findById(skl);
            if (!skl) {
                continue;
            }
            this.initSkill('skill_' + i, skl);
        }
    },
    initSkill: function (childName, skill) {
        var url = cc.url.raw('resources/graphics/skill/' + skill.icon + '.png');
        this.node.getChildByName('nd_skill').getChildByName(childName).active = true;
        this.node.getChildByName('nd_skill').getChildByName(childName).getChildByName('spt_icon').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(url);
        this.node.getChildByName('nd_skill').getChildByName(childName).getChildByName('lb_describe').getComponent(cc.Label).string = skill.desc;
        this.node.getChildByName('nd_skill').getChildByName(childName).getChildByName('lb_skillname').getComponent(cc.Label).string = skill.name;
    },
    hideAllSkill: function () {
        var children = this.node.getChildByName('nd_skill').children;
        for (var i = 0; i < children.length; ++i) {
            children[i].active = false;
            // cc.log("Node: " + children[i]);
        }
    },
    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
