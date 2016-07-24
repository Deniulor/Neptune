cc.Class({
    extends: cc.Component,

    properties: {
        horizontalBar: {
           type: cc.ProgressBar,
           default: null
       }
    },

    onLoad: function () {
        this.preLoadAllScene();
    },

    preLoadAllScene:function(){
        var allScene = ['menu','details','battle','guide'];
        var self = this;
        // 预加载
        self.progress = 0.0;
        var curProgress = 0;
        var onLoaded = function (err, assets) {
            curProgress ++;
            self.progress = curProgress/allScene.length;
            // cc.log(assets.name + ' scene preloaded');
        };
        for(var i = 0;i < allScene.length; ++i){
            cc.director.preloadScene(allScene[i], onLoaded);
        }
    },

    toMain:function(){
        // cc.director.loadScene('menu', onSceneLaunched);
        this.node.runAction(cc.sequence(
            cc.fadeOut(2),
            cc.callFunc(function(){
                cc.director.loadScene('menu');
            }))
        );
    },

    update:function(dt){
        var progress = this.horizontalBar.progress;
        if(progress < this.progress){
            progress +=dt;
        }
        if(progress >= 1){
            this.toMain();
        }
        this.horizontalBar.progress = progress;
    }
});
