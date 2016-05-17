cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        var fadeOut = cc.fadeOut(2);
        // var delay = cc.delayTime(3);
        var finish = cc.callFunc(this.change, this);
        this.node.runAction(cc.sequence(fadeOut,finish));
        // this.node.runAction(cc.fadeOut(5));
        
    },
    change: function(){
        // this.node.on(cc.Node.EventType.TOUCH_END,function(event){
        //     cc.director.loadScene('choose');
        // },this);
         cc.director.loadScene('menu');
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
