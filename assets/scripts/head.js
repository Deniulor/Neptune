cc.Class({
    extends: cc.Component,

    properties: {
        skill1: {
            default: null,
            type: cc.Node
        },
        skill2: {
            default: null,
            type: cc.Node
        },
        skill3: {
            default: null,
            type: cc.Node
        },
        skill1ID: "1",    // string
        skill2ID: "2",    // string
        skill3ID: "3",    // string
    },

    // use this for initialization
    onLoad: function () {
        var skill1sprite = this.skill1.getComponent(cc.Sprite);
        var skill1ID = this.skill1ID;
        cc.loader.loadRes("graphics/skill/"+ skill1ID + ".jpg/"+skill1ID, function (err, spriteFrame) {
            skill1sprite.spriteFrame = spriteFrame;
        });
        var skill2sprite = this.skill2.getComponent(cc.Sprite);
        var skill2ID = this.skill2ID;
        cc.loader.loadRes("graphics/skill/"+ skill2ID + ".jpg/"+skill2ID, function (err, spriteFrame) {
            skill2sprite.spriteFrame = spriteFrame;
        });
        var skill3sprite = this.skill3.getComponent(cc.Sprite);
        var skill3ID = this.skill3ID;
        cc.loader.loadRes("graphics/skill/"+ skill3ID + ".jpg/"+skill3ID, function (err, spriteFrame) {
            skill3sprite.spriteFrame = spriteFrame;
        });
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
