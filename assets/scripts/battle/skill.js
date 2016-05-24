cc.Class({
    extends: cc.Component,

    properties: {
        skillName:"",
    },

    // use this for initialization
    onLoad: function () {
        this.player = this.node.parent.getComponent('player');
        this.creatures = this.node.parent.parent.getChildByName('creatures');
        this.node.on('touchend',this.use,this);
    },

    use:function(){
        for(var i = 0;i < this.creatures.children.length; ++i){
            var creature = this.creatures.children[i].getComponent('creature');
            if(creature.camp != this.player.camp){
                creature.HP -= 20;
                creature.runDamageAction();
            }
        }
    },
});
