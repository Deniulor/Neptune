cc.Class({
    extends: cc.Component,

    properties: {
        creatures:{
            default: null,
            type: cc.Node
        },
        atbIcon:{
            default: null,
            type: cc.Prefab
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
        
        this.battle = this.node.parent.getComponent('BattleComp');

        this.preview = this.node.getChildByName('preview');
        this.preview.zIndex = 500;
    },

    addCreature:function (creature) {
        var stop = this.stop;
        this.stop = true;
        this.maxAtb = Math.max(creature.getComponent('creature').Atb, this.maxAtb);
        var uSprite = creature.getChildByName('creature').getChildByName('portrait').getComponent(cc.Sprite);
        creature.getChildByName('HpLab').active = false;
        let node = cc.instantiate(this.atbIcon);
        node.creature = creature;
        creature.getComponent('creature').icon = node;
        node.getChildByName('portrait').getComponent(cc.Sprite).spriteFrame = uSprite.spriteFrame;
        node.color = creature.getChildByName('creature').getChildByName('camp').color;
        node.setPositionY(20);

        this.node.addChild(node);
        creature.getChildByName('HpLab').active = true;
        this.stop = stop;
    },

    removeCreature:function (creature) {
        for (var i = 0; i < this.node.children.length; ++i) {
            var node = this.node.children[i];
            if (node.creature==creature) {
                this.node.removeChild(node);
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this.stop){
            return;
        }
        this.preview.active = false;
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
                this.showPreview(creature);
            }
            node.setPositionX(creature.curAtb / this.maxAtb * this.width);
        }
    },

    showPreview:function(creature){
        this.preview.active = true;
        this.preview.color = creature.node.getChildByName('creature').getChildByName('camp').color;
        this.preview.getChildByName('portrait').getComponent(cc.Sprite).spriteFrame
            = creature.node.getChildByName('creature').getChildByName('portrait').getComponent(cc.Sprite).spriteFrame;
        this.preview.setPositionX(creature.Atb / this.maxAtb * this.width);
    },
});
