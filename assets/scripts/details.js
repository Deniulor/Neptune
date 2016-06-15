cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        cc.director.preloadScene('menu', function () {
            cc.log('menu scene preloaded');
        });
    },
    close:function() {
       cc.director.loadScene('menu');
    },
});
