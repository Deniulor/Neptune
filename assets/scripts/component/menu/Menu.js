cc.Class({
    extends: cc.Component,

    properties: {
        menuMusic: {
            default: null,
            url: cc.AudioClip
        },
        clickEffect: {
            default: null,
            url: cc.AudioClip
        },
    },

    // use this for initialization
    onLoad: function () {
        this.node.runAction(cc.fadeIn(1));
        cc.audioEngine.playMusic(this.menuMusic, true);
        cc.director.preloadScene('details', function () {
            // cc.log('details scene preloaded');
        });
        cc.director.preloadScene('battle', function () {
            // cc.log('battle scene preloaded');
        });
    },
    details:function() {
        cc.audioEngine.playEffect(this.clickEffect, false);
        cc.director.loadScene('details');
    },
    practice:function() {
        cc.audioEngine.playEffect(this.clickEffect, false);
        if(cc.sys.localStorage.getItem('guided') == "true"){
            cc.director.loadScene('battle');
        } else {
            cc.director.loadScene('guide');
        }
    },
    resetGuide:function(){
        cc.sys.localStorage.setItem('guided', false);
    }
});
