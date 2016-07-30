var reproduction = cc.Class({
    extends: require('directiveskill'),
    
    effect:function(loc){
        var target = npt.battle.comp.getCreatureOn(loc.x, loc.y);
        if(!target){
            npt.battle.comp.floatMessage("错误的目标");
            return;
        }
        // 技能效果计算
        var creature = target.getComponent('creature');
        if((creature.camp == this.creature.camp && creature.data.id == this.creature.data.id&&creature.HP>0)){
            this.creature.reproduce = true;
            this.creature.turnEnd();
        }else{
            npt.battle.comp.floatMessage("你没法和对手交配啊");
            return false;
        }

        
        return true;
    },
});

module.exports = reproduction;