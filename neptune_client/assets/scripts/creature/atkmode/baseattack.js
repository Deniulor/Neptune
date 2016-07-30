var Attack = cc.Class({
    ctor: function () {
        this.name = "move";
        this.creature = null;
    },

    showAttack:function(){
        var self = this.creature;
        // var hastaget = false;
        
        // 返回false表示该区域可以攻击
        var invalid = function(x,y){
            var c = npt.battle.comp.getCreatureOn(x,4-y);
            if(c == null) return false; // 无单位显示攻击区域
            c = c.getComponent('creature');
            if(c == self) return false; // 可以选择自己
            if(c.camp != self.camp) return false; // 敌方单位 可以被攻击
            if(c.HP <= 0)  return false; // 己方单位
            return true;
        };

        var area = npt.tiled.getArea(npt.tiled.toHexagonLoc(this.creature.node.getPosition()), this.creature.Rng, invalid);
        for(var i = 0; i < area.length; ++i){
            var curnode = area[i];
            npt.battle.comp.funcLayer.setTileGID(5, cc.p(curnode.x, 3 - curnode.y));
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
        
        this.creature.node.getChildByName('creature').runAction(cc.sequence(attackAct));
    }
});

module.exports = Attack;