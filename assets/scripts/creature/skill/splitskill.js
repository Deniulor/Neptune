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
        knight1.getComponent('creature').init(this.battle, this.creature.camp, dataApi.creatures.findById(this.creature.id), battleTiled.randPixelLoc());
        this.damage = Math.ceil(this.creature.HP/2);
        knight1.getComponent('creature').HP -= this.damage;
        knight1.getComponent('creature').runDamageAction();
        this.battle.creatures.addChild(knight1);
        this.battle.node.getChildByName('atbBar').getComponent('atbBar').addChild();
        this.creature.onDamage(this.damage);
        this.creature.runDamageAction();
    },
});

module.exports = splitskill;