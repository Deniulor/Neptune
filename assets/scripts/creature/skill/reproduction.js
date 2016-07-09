var reproduction = cc.Class({
    extends: require('directiveskill'),
    
    effect:function(loc){
        var target = this.battle.getCreatureOn(loc.x, loc.y);
        if(!target){
            return;
        }
        // 技能效果计算
        var creature = target.getComponent('creature');
        if(((creature.camp != this.creature.camp && creature.data.id != this.creature.data.id)||creature.HP<=0)){
            return false;
        }

        this.creature.reproduce = true;
        this.creature.turnEnd();
        return true;
    },
});

module.exports = reproduction;