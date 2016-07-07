var SKill = cc.Class({
    init:function(skill,creature){
        this.data = skill;
        this.name = skill.name;
        this.creature = creature;
        this.battle = creature.battle;

        this.node = cc.instantiate(this.battle.skillPrefab);
        let sprite = this.node.getComponent(cc.Sprite);
        var url = cc.url.raw('resources/graphics/skill/' + skill.icon + '.png');
        sprite.spriteFrame = new cc.SpriteFrame(url);

        this.bindEvent(this.node);
    },

    bindEvent:function(node){

    },
});

module.exports = SKill;