var battleTiled = require('battleTiled');
var exp = cc.Class({
	extends: require('basemove'),
    ctor:function(){
    	this.name = "teleport";
    },

    moveto:function(to_x, to_y){
    	var creature = this.creature;
    	var teleport = [];
        teleport.push(cc.fadeOut(0.5));
		teleport.push(cc.moveTo(0.05, battleTiled.toPixelLoc(to_x, to_y)));
        teleport.push(cc.fadeIn(0.5));
        teleport.push(cc.callFunc(function(){
            creature.action = 'attack';
        }));
        this.creature.node.runAction(cc.sequence(teleport));
    }
});

module.exports = exp;