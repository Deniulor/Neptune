cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {

    },

    beginFight:function(){
        cc.sys.localStorage.setItem('guided', true);
        cc.director.loadScene('battle');
    }
});
