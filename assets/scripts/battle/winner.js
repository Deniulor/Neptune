cc.Class({
    extends: cc.Component,

    properties: {
        winMusic: {
            default: null,
            url: cc.AudioClip
        },
    },
    
    setWinner:function(winner){
        this.winner = winner;
        var url = cc.url.raw('resources/graphics/ui/' + this.winner + '.png');
        var frame = new cc.SpriteFrame(url);
        this.node.getChildByName('content').getChildByName('camp').getComponent(cc.Sprite).spriteFrame = frame;
        cc.audioEngine.setEffectsVolume(0.5);
        cc.audioEngine.playEffect(this.winMusic, false);
        
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
