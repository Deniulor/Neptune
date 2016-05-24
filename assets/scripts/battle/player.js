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
        camp:"",
        skill1:{
            default:null,
            type:cc.Node
        },
        skill2:{
            default:null,
            type:cc.Node
        },
        skill3:{
            default:null,
            type:cc.Node
        },
        battle:{
            default:null,
            type:require('battle')
        }
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
