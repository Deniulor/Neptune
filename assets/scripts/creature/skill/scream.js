var splitskill = cc.Class({
    extends: require('effectskill'),

    effect:function(){
        // 选取周围指定范围内的单位
        var near = npt.tiled.getArea(this.creature.getHexLoc(), this.data.rng);

        // 播放特效
        this.creature.play(this.data.animation);

        // 造成伤害
        for(var i = 0;i < near.length; ++i){
            var creature = near[i];
            creature = this.battle.getCreatureOn(creature.x, creature.y);
            if(creature == null)
                continue;
            creature = creature.getComponent('creature');
            if(creature.camp == this.creature.camp || creature.HP <= 0)
                continue;

            creature.onDamage(this.data.damage);
            creature.runDamageAction();
        }
        return true;
    },
});

module.exports = splitskill;