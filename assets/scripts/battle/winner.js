cc.Class({
    extends: cc.Component,

    properties: {
        // ...
    },
    
    setWinner:function(winner){
        this.winner = winner;
        var url = cc.url.raw('resources/graphics/ui/' + this.winner + '.png');
        var frame = new cc.SpriteFrame(url);
        this.node.getChildByName('content').getChildByName('camp').getComponent(cc.Sprite).spriteFrame = frame;
    },

    // use this for initialization
    onLoad: function () {
        var bg = this.node.getChildByName('background');
        bg.on("touchstart", function(event){
            event.stopPropagation();
        }, bg);
    },
    
    retry:function(){
        cc.director.loadScene('battle'); //注意通过 res.scene 获取场景实例
    },
    
    backToMenu:function(){
        cc.director.loadScene('menu'); //注意通过 res.scene 获取场景实例
    }
    
    

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
