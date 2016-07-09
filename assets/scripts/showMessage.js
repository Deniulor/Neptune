var showMessage =cc.Class({
    properties: {
        winnerPrefab:{
            default: null,
            type: cc.Prefab
        },
    },
    init:function (battle,message) {
        cc.loader.loadRes("prefab/message", function (err, prefab) {
        var newNode = cc.instantiate(prefab);
        newNode.getComponent(cc.Label).string = message;
        battle.node.addChild(newNode);
        newNode.runAction(cc.sequence(cc.moveBy(1.0,0,100),cc.fadeOut(1)));
        });
    },
});
module.exports = new showMessage();