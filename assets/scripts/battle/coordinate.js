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
        // ...
    },

    // use this for initialization
    onLoad: function () {
        var tiled = this.node.parent.getComponent('battleTiled');
        for(var x = 0; x < tiled.MapWidth; ++x){
            for(var y = 0;y < tiled.MapHeight; ++y){
                let node = new cc.Node();
                let label = node.addComponent(cc.Label);
                label.fontSize = 25;
                label.lineHeight = 25;
                label.string = cc.js.formatStr("(%s,%s)", x, y);
                node.position = tiled.toPixelLoc(x, y);
                this.node.addChild(node);
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
