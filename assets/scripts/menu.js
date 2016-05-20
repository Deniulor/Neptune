cc.Class({
    extends: cc.Component,

    properties: {
        menuMusic: {
            default: null,
            url: cc.AudioClip
        },
    },

    // use this for initialization
    onLoad: function () {
        this.node.runAction(cc.fadeIn(1));
        cc.repeatForever(cc.audioEngine.playEffect(this.menuMusic, false));
    },
    details:function() {
       cc.director.loadScene('details');
    },
    practice:function() {
        cc.director.loadScene('battle');
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
