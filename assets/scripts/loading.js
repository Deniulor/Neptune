cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
        var self = this;
        // 加载 test assets 目录下所有资源
        cc.loader.loadResAll("data", function (err, assets) {
            cc.log(assets);
            self.toMain();
        });
    },

    toMain:function(){
        this.node.runAction(cc.sequence(
            cc.fadeOut(2),
            cc.callFunc(function(){
                cc.director.loadScene('menu');
            })),
        );
    }
});
