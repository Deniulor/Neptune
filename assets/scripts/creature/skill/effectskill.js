var effectskill = cc.Class({
    extends: require('skillbase'),

    bindEvent:function(node){
        this.node.on('touchend',this.effect0,this);
    },
    
    effect0:function(event){
        if(this.creature.skillUsed){ // 用过技能了
            return;
        }
        if(this.effect()){
            this.creature.skillUsed = true;
        }
        event.stopPropagation();
    },

    effect:function(){
        // 技能效果计算
        for(var i = 0;i < this.battle.creatures.children.length; ++i){
            var creature = this.battle.creatures.children[i].getComponent('creature');
            if(creature.camp != this.creature.camp){
                creature.HP -= this.data.damage;
                creature.runDamageAction();
            }
        }
        return true;
    }
});

module.exports = effectskill;