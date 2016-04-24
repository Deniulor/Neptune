cc.Class({
    extends: cc.Component,

    properties: {
        atkPlayer: {
            default: null,
            type: cc.Node
        },
        defPlayer: {
            default: null,
            type: cc.Node
        },
        atkHead: "55",    // string
        defHead: "qiya",    // string
    },

    // use this for initialization
    onLoad: function () {
        var atksprite = this.atkPlayer.getComponent(cc.Sprite);
        var atkheadID = this.atkHead;
        cc.loader.loadRes(atkheadID + ".jpg/"+atkheadID, function (err, spriteFrame) {
            atksprite.spriteFrame = spriteFrame;
        });
        var defheadID = this.defHead;
        var defsprite = this.defPlayer.getComponent(cc.Sprite);
        cc.loader.loadRes(defheadID + ".jpg/"+defheadID, function (err, spriteFrame) {
            defsprite.spriteFrame = spriteFrame;
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
