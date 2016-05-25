cc.Class({
    extends: cc.Component,

    properties: {
        skillName:"",
    },

    // use this for initialization
    onLoad: function () {
        this.player = this.node.parent.getComponent('player');
        this.creatures = this.node.parent.parent.getChildByName('creatures');
        this.battle  = this.node.parent.parent.getComponent('battle');
        this.node.on('touchend',this.use,this);
    },

    use:function(){
        var selected = this.battle.selected.getComponent('creature');
        if(selected.camp != this.player.camp){
            return;
        }
        for(var i = 0;i < this.creatures.children.length; ++i){
            var creature = this.creatures.children[i].getComponent('creature');
            if(creature.camp != this.player.camp){
                creature.HP -= 20;
                creature.runDamageAction();
            }
        }
    },
});
