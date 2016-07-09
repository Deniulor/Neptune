var hypnosis = cc.Class({
    extends: require('directiveskill'),
    
    effect:function(loc){
        var target = this.battle.getCreatureOn(loc.x, loc.y);
        if(!target){
            this.battle.floatMessage("错误的目标");
            return;
        }
        // 技能效果计算
        var creature = target.getComponent('creature');
        if(creature.camp == this.creature.camp){
            this.battle.floatMessage("你要谋害队友吗？");
            return false;
        }
        // this.battle.removeCreature(creature.node);
        // cc.log("hypnosis done");
        creature.waitRound = 2;
        this.creature.turnEnd();
        return true;
    },
});

module.exports = hypnosis;
