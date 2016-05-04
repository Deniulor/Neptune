cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        units:{
            default: null,
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad: function () {
        for(var i = 0; i < this.units.children.length; ++i){
            var unit = this.units.children[i];
            var uSprite = unit.getComponents(cc.Sprite);
            let node = cc.instantiate(unit);
            node.unit = unit;
            this.node.addChild(node);
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        for(var i = 0; i < this.node.children.length; ++i){
            var node = this.node.children[i];
            if(!node.unit){
                continue;
            }
            var unit = node.unit.getComponent('unit');
            var atb = unit.getATB();
            if(atb > 0){
               cc.log("atb" + atb); 
            }
            node.setPosition(atb * 100, 20);
        }
    },
});
