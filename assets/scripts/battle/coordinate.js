cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        for(var x = 0; x < npt.tiled.MapWidth; ++x){
            for(var y = 0;y < npt.tiled.MapHeight; ++y){
                let node = new cc.Node();
                let label = node.addComponent(cc.Label);
                label.fontSize = 25;
                label.lineHeight = 25;
                label.string = cc.js.formatStr("(%s,%s)", x, y);
                node.position = npt.tiled.toPixelLoc(x, y);
                this.node.addChild(node);
            }
        }
    },
});
