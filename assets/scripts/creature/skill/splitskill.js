var battleTiled = require('battleTiled');
var splitskill = cc.Class({
    extends: require('effectskill'),

    effect:function(){        
        // 使用给定的模板在场景中生成一个新节点

        var hp = Math.ceil(this.creature.HP/2);

        var clone = cc.instantiate(this.battle.creaturePrefab);
        clone = clone.getComponent('creature'); 
        clone.init(this.battle, this.creature.camp, this.creature.data, battleTiled.randPixelLoc());
        this.battle.addCreature(clone.node);

        clone.HP = hp;
        clone.showHP = hp;
        clone.runDamageAction();

        this.creature.onDamage(hp);
        this.creature.runDamageAction();
        return true;
    },
});

module.exports = splitskill;