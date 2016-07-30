var Move = cc.Class({
    ctor: function () {
        this.name = "move";
        this.creature = null;
    },

    showMovable:function(){
        var self = this;

        // 返回false表示该区域可以移动
        var invalid = function(x,y){
            var c = npt.battle.comp.getCreatureOn(x,y);
            if(c == null)
                return false;
            c = c.getComponent('creature');
            if(c == self.creature)
                return false;
            if(c.HP <= 0)
                return false;
            return true;
        };

        var area = npt.tiled.getArea(npt.tiled.toHexagonLoc(this.creature.node.getPosition()), this.creature.Mov, invalid);
        
        for(var i = 0; i < area.length; ++i){
            var curnode = area[i];
            npt.battle.comp.funcLayer.setTileGID(4, cc.p(curnode.x, 3 - curnode.y));
        }
    },

    moveto:function(to_x, to_y, cb){
        var self = this;
        var battle = npt.battle.comp;
        var creature = self.creature;

        var from = npt.tiled.toHexagonLoc(this.creature.node.getPosition());
        var path = npt.tiled.getPath(from, cc.p(to_x,to_y), function(x, y){
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
            path[i] = cc.moveTo(0.05, npt.tiled.toPixelLoc(path[i].x, path[i].y)); 
        }
        
        path.push(cc.callFunc(function(){ 
            creature.action = 'attack';
            if(cb) cb();
        }));
        this.creature.node.runAction(cc.sequence(path));
    }
});

module.exports = Move;