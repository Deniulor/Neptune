cc.Class({
    extends: cc.Component,

    properties: {
        background: {
            default: null,
            type:cc.Node
        },

        effectOn:{
            default:null,
            type:cc.Node
        },
        effectOff:{
            default:null,
            type:cc.Node
        },

        musicOn:{
            default:null,
            type:cc.Node
        },
        musicOff:{
            default:null,
            type:cc.Node
        },
    },

    // use this for initialization
    onLoad: function () {
        this.background.on('touchstart',function(event){
            event.stopPropagation();
        });
        if(npt.audio.getEffectsVolume() > 0){
            this.setEffectOn();
        }else{
            this.setEffectOff();
        }

        if(npt.audio.getMusicVolume() > 0){
            this.setMusicOn();
        }else{
            this.setMusicOff();
        }

    },

    resumes: function(){
        this.node.active = false;
    },

    menu: function(){
        cc.director.loadScene('menu'); //注意通过 res.scene 获取场景实例
    },

    setEffectOn: function(){
        npt.audio.setEffectsVolume(0.8);
        this.effectOn.active = true;
        this.effectOff.active = false;
    },
    setEffectOff: function(){
        npt.audio.setEffectsVolume(0);
        this.effectOn.active = false;
        this.effectOff.active = true;
    },

    setMusicOn: function(){
        npt.audio.setMusicVolume(0.8);
        this.musicOn.active = true;
        this.musicOff.active = false;
    },
    setMusicOff: function(){
        npt.audio.setMusicVolume(0);
        this.musicOn.active = false;
        this.musicOff.active = true;
    }
});
