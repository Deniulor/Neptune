cc.Class({
    extends: cc.Component,

    properties: {
        camp:"",
        maxSanity:30,
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
            type:require('Battle')
        }
    },

    // use this for initialization
    onLoad: function () {
        this.sanity = 0;
    },
    
    // 增加san值
    incSanity:function(value){
        this.sanity += value;
        if(this.sanity >= this.maxSanity){
            this.sanity = this.maxSanity;
        }
        this.node.getChildByName('san').getComponent(cc.ProgressBar).progress = this.sanity / this.maxSanity;
    }
});
