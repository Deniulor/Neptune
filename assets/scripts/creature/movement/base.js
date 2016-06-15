var battleTiled = require('battleTiled');


var Move = cc.Class({
    ctor: function () {
        this.name = "move";
    	this.creature = null;
    	this.battle = null;
    	this.Mov = 0;
    },

    showMovable:function(){
    	var self = this;
    	var area = battleTiled.getArea(battleTiled.toHexagonLoc(this.creature.node.getPosition()), this.Mov, function(x,y){
            var c = self.battle.getCreatureOn(x,y);
            c = c===null ? null : c.getComponent('creature');
            return c !== null && c !== self && c.HP > 0;
        });
        
        for(var i = 0; i < area.length; ++i){
            var curnode = area[i];
            self.battle.funcLayer.setTileGID(4, cc.p(curnode.x, 3 - curnode.y));
        }
    }
});

module.exports = Move;