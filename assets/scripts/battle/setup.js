cc.Class({
    extends: cc.Component,

    properties: {
        background: {
            default: null,
            type:cc.Node
        },
    },

    // use this for initialization
    onLoad: function () {
        this.background.on('touchstart',function(event){
            event.stopPropagation();
        });
    },

    resumes: function(){
        this.node.active = false;
    },

    menu: function(){
        cc.director.loadScene('menu'); //注意通过 res.scene 获取场景实例
    }
});
