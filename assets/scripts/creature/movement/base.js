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
    },

    moveto:function(to_x, to_y){
        var self = this;
        var battle = self.battle;
        var creature = self.creature;
        var from = battleTiled.toHexagonLoc(this.creature.node.getPosition());

        var path = battleTiled.getPath(from, cc.p(to_x,to_y), function(x, y){
            var c = battle.getCreatureOn(x, y);
            if(c !== null && c != creature){
                true; // 不允许穿人
            }
        });
        if(!path || path.length <= 0){
            cc.log("没有找到出路");
            return;
        }
        for(var i = 0; i < path.length; ++i){
            path[i] = cc.moveTo(0.05, battleTiled.toPixelLoc(path[i].x, path[i].y)); 
        }
        
        path.push(cc.callFunc(function(){ 
            creature.action = 'attack';
        }));
        this.creature.node.runAction(cc.sequence(path));
    }
});

module.exports = Move;