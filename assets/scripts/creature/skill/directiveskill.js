var battleTiled = require('battleTiled');

var directiveskill = cc.Class({
    extends: require('skillbase'),

    bindEvent:function(node){
        this.node.on('touchstart',this.beginSkill,this);
        this.node.on('touchmove',this.moveSkill,this);
        this.node.on('touchend',this.useSkill,this);
        this.node.on('touchcancel',this.useSkill,this);
    },
    
    beginSkill:function(){
        if(this.creature.skillUsed){ // 用过技能了
            return;
        }
        
        this.battle.stopUpdate = true;
        this.skilling = true;
        return true; 
    },
    moveSkill:function(event){
        if(!this.skilling){
            return;
        }
        this.battle.clearFuncLayer();
        
        var loc = event.getLocation();
        var temp = this.battle.node.convertToNodeSpace(loc);
        loc = battleTiled.toHexagonLoc(temp);
        if(battleTiled.isLocValid(loc)){
            this.battle.funcLayer.setTileGID(4, cc.p(loc.x, battleTiled.MapHeight - 1 - loc.y));
            this.skillTaget = this.battle.getCreatureOn(loc.x, loc.y);
        }
    },
    
    useSkill:function(){
        if(!this.skilling){
            return;
        }
        
        this.skilling = false;
        this.battle.stopUpdate = false;
        
        if(!this.skillTaget){
            return;
        }
        // 技能效果计算
        var creature = this.skillTaget.getComponent('creature');
        var animate = this.skillTaget.getChildByName('Sprite').getChildByName('animate').getComponent(cc.Animation);
        if(creature.camp != this.creature.camp){
            this.creature.skillUsed = true;
            creature.HP -= this.data.damage;
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
    }
});

module.exports = directiveskill;