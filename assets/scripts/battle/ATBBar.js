cc.Class({
    extends: cc.Component,

    properties: {
        creatures:{
            default: null,
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad: function () {
        this.maxAtb = -1;
        this.width = this.node.getChildByName('BG').width;
        for(var i = 0; i < this.creatures.children.length; ++i){
            var creature = this.creatures.children[i];
            this.maxAtb = Math.max(creature.getComponent('creature').Atb, this.maxAtb);
            var uSprite = creature.getComponents(cc.Sprite);
            let node = cc.instantiate(creature);
            node.creature = creature;
            this.node.addChild(node);
        }
        this.stop = false;
        
        this.battle = this.node.parent.getComponent('battle');
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this.stop){
            return;
        }
        for(var i = 0; i < this.node.children.length; ++i){
            var node = this.node.children[i];
            if(!node.creature){
                continue;
            }
            var creature = node.creature.getComponent('creature');
            creature.curAtb -= dt;
            if(creature.curAtb <= 0){
                this.battle.selected = node.creature;
                this.battle.showMovable();
                this.stop = true;
            }
            node.setPosition(creature.curAtb / this.maxAtb * this.width, 20);
        }
    },
});
