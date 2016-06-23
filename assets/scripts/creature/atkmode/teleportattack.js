var battleTiled = require('battleTiled');

var Teleportattack = cc.Class({
    extends: require('baseattack'),
    ctor: function () {
        this.name = "teleportattack";
        this.creature = null;
        this.battle = null;
    },

    attack:function(target){
        var distLoc = this.creature.node.getPosition();
        var targetLoc = target.node.getPosition();

        var attackAct = [];
        var jump = cc.jumpBy(0.5, targetLoc.x - distLoc.x, targetLoc.y - distLoc.y, 20, 1);
        attackAct.push(jump);
        var atk = cc.spawn(cc.sequence(cc.rotateBy(0.1, 10, 10),cc.rotateBy(0.1, -10, -10),cc.rotateBy(0.1, 10, 10),cc.rotateBy(0.1, -10, -10)));
        attackAct.push(atk);
        attackAct.push(cc.moveBy(0.5, cc.p(distLoc.x - targetLoc.x, distLoc.y - targetLoc.y)));
        attackAct.push(cc.callFunc(function(){
            target.runDamageAction();
        }));

        if(this.creature.zIndex != target.zIndex){
            let max = Math.max(this.creature.zIndex, target.zIndex);
            let min = Math.min(this.creature.zIndex, target.zIndex);
            this.creature.zIndex = max;
            target.zIndex = min;
        } else {
            this.creature.zIndex ++; 
        }        
        target.onDamage(this.creature.Atk);
        target.setStatus("bleeding");
        this.creature.node.getChildByName('Sprite').runAction(cc.sequence(attackAct));
        this.battle.setSelected(null);
    }
});
module.exports = Teleportattack;
