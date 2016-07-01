var SKill = cc.Class({
    init:function(skill,creature){
        this.data = skill;
        this.name = skill.name;
        this.creature = creature;
        this.battle = creature.battle;

        this.node = new cc.Node();
        let sprite = this.node.addComponent(cc.Sprite);
        var url = cc.url.raw('resources/graphics/skill/' + skill.icon + '.png');
        sprite.spriteFrame = new cc.SpriteFrame(url);

        this.bindEvent(this.node);
    },

    bindEvent:function(node){

    },
});

module.exports = SKill;