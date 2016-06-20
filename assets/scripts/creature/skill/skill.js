cc.Class({
    extends: cc.Component,

    properties: {
        skillName:"",
    },
    
    beginFog:function(){
        if(!this.battle.selected){
            return;
        }
        var selected = this.battle.selected.getComponent('creature');
        if(selected.camp != this.player.camp){
            return;
        }
        if(this.player.skillUsed){ // 用过技能了
            return;
        }
        
        this.battle.stopUpdate = true;
        this.fog = true;
        return true; 
    },
    moveFog:function(event){
        if(!this.fog){
            return;
        }
        this.battle.clearFuncLayer();
        
        var loc = event.getLocation();
        var temp = this.battle.node.convertToNodeSpace(loc);
        loc = this.tiled.toHexagonLoc(temp);
        if(this.tiled.isLocValid(loc)){
            this.battle.funcLayer.setTileGID(4, cc.p(loc.x, this.tiled.MapHeight - 1 - loc.y));
            this.fogTaget = this.battle.getCreatureOn(loc.x, loc.y);
        }
    },
    
    useFog:function(){
        if(!this.fog){
            return;
        }
        
        this.fog = false;
        this.battle.stopUpdate = false;
        
        if(!this.fogTaget){
            return;
        }
        // 技能效果计算
        var creature = this.fogTaget.getComponent('creature');
        var animate = this.fogTaget.getChildByName('animate').getComponent(cc.Animation);
        if(creature.camp != this.player.camp){
            this.player.skillUsed = true;
            this.player.incSanity(15);
            creature.HP -= 40;
            creature.runDamageAction();
            cc.loader.loadRes("animate/disappear", function (err, clip) {
                if(err){
                    cc.log(err);
                    return;
                }
                animate.addClip(clip);
                animate.play(clip.name);
            });
        }
    },

    dark:function(){
        if(!this.battle.selected){
            return;
        }
        var selected = this.battle.selected.getComponent('creature');
        if(selected.camp != this.player.camp){
            return;
        }
        if(this.player.skillUsed){ // 用过技能了
            return;
        }
        this.player.skillUsed = true;
        
        // 技能效果计算
        this.player.incSanity(5);
        for(var i = 0;i < this.creatures.children.length; ++i){
            var creature = this.creatures.children[i].getComponent('creature');
            if(creature.camp != this.player.camp){
                creature.HP -= 20;
                creature.runDamageAction();
            }
        }
    },
});
