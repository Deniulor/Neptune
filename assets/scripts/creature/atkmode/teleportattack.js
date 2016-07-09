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
            target.play("attack");
            target.runDamageAction();
        }));

        if(this.creature.node.zIndex != target.node.zIndex){
            let max = Math.max(this.creature.node.zIndex, target.node.zIndex);
            let min = Math.min(this.creature.node.zIndex, target.node.zIndex);
            this.creature.node.zIndex = max;
            target.node.zIndex = min;
        } else {
            this.creature.node.zIndex ++; 
        }
        target.onDamage(this.creature.Atk);
        
        target.setStatus("bleeding");
        this.creature.node.getChildByName('creature').runAction(cc.sequence(attackAct));
    }
});
module.exports = Teleportattack;
