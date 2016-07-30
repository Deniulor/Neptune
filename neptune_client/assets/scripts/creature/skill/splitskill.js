var splitskill = cc.Class({
    extends: require('effectskill'),

    effect:function(){
        if(this.creature.HP <= 2){
            npt.battle.comp.floatMessage("血量必须大于2才能使用");
            return false;
        }
        // 使用给定的模板在场景中生成一个新节点
        // 播放特效
        // this.creature.play(this.data.animation);
        if(!this.randInvalidFunc){
            this.randInvalidFunc = function(x, y){
                var c = npt.battle.comp.getCreatureOn(x,y);
                return c !== null && c.getComponent('creature').HP > 0;
            }
        }
        
        var hp = Math.ceil(this.creature.HP/2);

        // var clone = cc.instantiate(npt.battle.comp.creaturePrefab);
        // clone = clone.getComponent('creature'); 
        // clone.init(this.creature.camp, this.creature.data, npt.tiled.randPixelLoc(this.randInvalidFunc));
        // npt.battle.comp.addCreature(clone.node);
        // clone.play(this.data.animation);
        var clone = this.creature.cloneCreature(this.data.animation);
        clone.HP = hp;
        clone.showHP = hp;
        clone.runDamageAction();

        this.creature.onDamage(hp);
        this.creature.runDamageAction();
        this.creature.turnEnd();
        return true;
    },
});

module.exports = splitskill;