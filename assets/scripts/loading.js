cc.Class({
    extends: cc.Component,

    properties: {
        horizontalBar: {
           type: cc.ProgressBar,
           default: null
       }
    },

    onLoad: function () {
        var self = this;
        // 预加载
        self.progress = 0.0;
        var total = 4;
        self.curProgress = 1;
        cc.director.preloadScene('menu', function () {
            self.progress = self.curProgress/total;
            self.curProgress ++;
            cc.log('menu scene preloaded');
        });
        cc.director.preloadScene('details', function () {
            self.progress = self.curProgress/total;
            self.curProgress ++;
            cc.log('details scene preloaded');
        });
        cc.director.preloadScene('battle', function () {
            self.progress = self.curProgress/total;
            self.curProgress ++;
            cc.log('battle scene preloaded');
        });
        // 加载 test assets 目录下所有资源
        cc.loader.loadResAll("data", function (err, assets) {
            cc.log(assets);
            self.progress = self.curProgress/total;
            self.curProgress ++;
        });
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
        // else {
        //     progress = 0;
        // }
        this.horizontalBar.progress = progress;
    }
});
