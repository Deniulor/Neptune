var battleTiled = require('battleTiled');

var Attack = cc.Class({
    ctor: function () {
        this.name = "move";
        this.creature = null;
        this.battle = null;
    },

    showAttack:function(){
        var self = this.creature;
        var hastaget = false;
        
        var area = battleTiled.getArea(battleTiled.toHexagonLoc(this.creature.node.getPosition()), this.creature.Rng, function(x,y){
            var c = self.battle.getCreatureOn(x,y);
            c = c===null ? null : c.getComponent('creature');
            hastaget = hastaget ||( c!==null && c.camp != self.camp && c.HP > 0 );
            return c !== null && c.camp == self.camp;
        });
        if(!hastaget){
            this.creature.turnEnd();
            this.battle.setSelected(null);
            return;
        }
        for(var i = 0; i < area.length; ++i){
            var curnode = area[i];
            self.battle.funcLayer.setTileGID(5, cc.p(curnode.x, 3 - curnode.y));
        }
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
        
        this.creature.node.getChildByName('Sprite').runAction(cc.sequence(attackAct));
        this.battle.setSelected(null);
    }
});

module.exports = Attack;