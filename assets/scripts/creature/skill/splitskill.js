var battleTiled = require('battleTiled');
var dataApi = require('dataApi');
var splitskill = cc.Class({
    extends: require('skillbase'),

    bindEvent:function(node){
        this.node.on('touchend',this.split,this);
    },
    
    split:function(){
        if(this.creature.skillUsed){ // 用过技能了
            return;
        }
        this.creature.skillUsed = true;
        
        // 使用给定的模板在场景中生成一个新节点
        var knight1 = cc.instantiate(this.battle.creaturePrefab);
        knight1.getComponent('creature').init(this.battle, this.creature.camp, dataApi.creatures.random(), battleTiled.randPixelLoc());
        this.battle.creatures.addChild(knight1);
        
        
        // 技能效果计算
        // for(var i = 0;i < this.battle.creatures.children.length; ++i){
        //     var creature = this.battle.creatures.children[i].getComponent('creature');
        //     if(creature.camp != this.creature.camp){
        //         creature.HP -= this.data.damage;
        //         creature.runDamageAction();
        //     }
        // }
    },
});

module.exports = splitskill;