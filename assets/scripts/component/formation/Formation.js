cc.Class({
    extends: cc.Component,

    properties: {
        prefab: {
            default:null,
            type:cc.Prefab
        },
        creatures: {
            default:null,
            type:cc.Node
        },
    },

    // use this for initialization
    onLoad: function () {
        var all = npt.data.creatures.all();
        var self = this;
        for (var i in all) {
            (function (){
                var creature = cc.instantiate(self.prefab);
                var subnode = creature.getChildByName('creature');
                var data = all[i];
                // 加载 SpriteFrame
                creature.getChildByName("HpLab").getComponent(cc.Label).string = data.hp + "/" + data.hp;
                cc.loader.loadRes('graphics/creature/' + data.icon, cc.SpriteFrame, function (err, spriteFrame) {
                    subnode.getChildByName('portrait').getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
                subnode.getChildByName('camp').color = npt.config.red;
                self.creatures.addChild(creature);
            })();

        }
    },
});
