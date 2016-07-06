var callmessage =cc.Class({
    properties: {
        winnerPrefab:{
            default: null,
            type: cc.Prefab
        },
    },
    init:function (message) {
        // var url = cc.url.raw('resources/prefab/message');
        // var red1 = cc.instantiate(url);
        cc.loader.loadRes("prefab/message", function (err, prefab) {
        var newNode = cc.instantiate(prefab);
        newNode.getComponent(cc.Label).string = message;
        // cc.moveBy(1.0,0,-300);
        // cc.fadeOut(0.5);
        // newNode.runAction(cc.sequence(cc.moveBy(1.0,0,-300),cc.fadeOut(0.5)));
        // cc.director.getScene().addChild(newNode);
        });
    },
});
module.exports = new callmessage();