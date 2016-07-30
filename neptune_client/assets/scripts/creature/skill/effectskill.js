var effectskill = cc.Class({
    extends: require('skillbase'),

    bindEvent:function(node){
        this.node.on('touchend',this.effect0,this);
    },
    
    effect0:function(event){
        if(this.creature.skillUsed){ // 用过技能了
            return;
        }
        if(this.popDetail){ // 在长按已经生效
            return;
        }
        if(this.effect()){
            this.creature.setSkillUsed(true);
        }
    },

    effect:function(){
        // 技能效果计算
        for(var i = 0;i < npt.battle.comp.creatures.children.length; ++i){
            var creature = npt.battle.comp.creatures.children[i].getComponent('creature');
            if(creature.camp != this.creature.camp){
                creature.HP -= this.data.damage;
                creature.runDamageAction();
            }
        }
        return true;
    }
});

module.exports = effectskill;