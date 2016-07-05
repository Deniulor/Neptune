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
            this.addCreature(creature);
        }
        this.stop = false;
        
        this.battle = this.node.parent.getComponent('battle');
    },

    addCreature:function (creature) {
        var stop = this.stop;
        this.stop = true;
        this.maxAtb = Math.max(creature.getComponent('creature').Atb, this.maxAtb);
        var uSprite = creature.getComponents(cc.Sprite);
        creature.getChildByName('HpLab').active = false;
        let node = cc.instantiate(creature);
        node.creature = creature;
        creature.getComponent('creature').icon = node;
        node.setPositionY(20);

        this.node.addChild(node);
        creature.getChildByName('HpLab').active = true;
        this.stop = stop;
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
            if(creature.HP <= 0 ){
                continue;
            }
            creature.curAtb -= dt;
            if(creature.curAtb <= 0){
                this.stop = true;
                this.battle.setSelected(node.creature);
            }
            node.setPositionX(creature.curAtb / this.maxAtb * this.width);
        }
    },
});
