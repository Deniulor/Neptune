var effectskill = cc.Class({
    extends: require('skillbase'),

    bindEvent:function(node){
        this.node.on('touchend',this.effect,this);
    },
    
    effect:function(){
        if(this.creature.skillUsed){ // 用过技能了
            return;
        }
        this.creature.skillUsed = true;
        
        // 技能效果计算
        for(var i = 0;i < this.battle.creatures.children.length; ++i){
            var creature = this.battle.creatures.children[i].getComponent('creature');
            if(creature.camp != this.creature.camp){
                creature.HP -= this.data.damage;
                creature.runDamageAction();
            }
        }
    },
});

module.exports = effectskill;