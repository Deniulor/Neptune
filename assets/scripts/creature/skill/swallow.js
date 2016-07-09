var swallow = cc.Class({
    extends: require('directiveskill'),
    
    effect:function(loc){
        var target = this.battle.getCreatureOn(loc.x, loc.y);
        if(!target){
            this.battle.floatMessage("错误的目标");
            return false;
        }
        // 技能效果计算
        var creature = target.getComponent('creature');
        if(creature.camp != this.creature.camp || creature.HP <= 0||creature.__instanceId ==this.creature.__instanceId){
            this.battle.floatMessage("对象应该是除了自己以外的队友");
            return false;
        }
        var hp = Math.ceil(creature.HP/2);
        var atk = Math.ceil(creature.Atk/2);
        this.creature.addAttrValue("HP",hp);
        this.creature.addAttrValue("ATK",atk);
        this.battle.removeCreature(creature.node);
        this.creature.turnEnd();
        return true;
    },
});

module.exports = swallow;