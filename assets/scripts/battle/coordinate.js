var battleTiled = require('battleTiled');
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        for(var x = 0; x < battleTiled.MapWidth; ++x){
            for(var y = 0;y < battleTiled.MapHeight; ++y){
                let node = new cc.Node();
                let label = node.addComponent(cc.Label);
                label.fontSize = 25;
                label.lineHeight = 25;
                label.string = cc.js.formatStr("(%s,%s)", x, y);
                node.position = battleTiled.toPixelLoc(x, y);
                this.node.addChild(node);
            }
        }
    },
});
