cc.Class({
    extends: cc.Component,
    
    properties: {
        map: {
            default: null,
            type: cc.TiledMap
        },
        goundLayer: {
            default: null,
            type: cc.TiledLayer
        },
        funcLayer:{
            default: null,
            type: cc.TiledLayer
        },
        creaturePrefab: {
            default: null,
            type: cc.Prefab
        },
    },
    
    // 加载事件
    onLoad: function () {
        var self = this;
        self.tiled = self.getComponent('battleTiled');
        
        // 放置单位
        self.putonCreatures();
        self.node.on("touchend", self.onTouchEnded, self.node);
    },
    
    putonCreatures:function(){
        var url1 = cc.url.raw('resources/graphics/creature/creature1.png');
        var c1 = new cc.SpriteFrame(url1, cc.Rect(0, 0, 329, 337), false, 0, cc.Size(100, 100));
        
        // 使用给定的模板在场景中生成一个新节点
        var knight1 = cc.instantiate(this.creaturePrefab);
        knight1.getComponent('creature').init("Knight", 3, 100, 3, 1);
        knight1.setPosition(this.tiled.toPixelLoc(0, 0));
        knight1.getComponent(cc.Sprite).spriteFrame = c1;
        this.node.addChild(knight1);
        
        var knight2 = cc.instantiate(this.creaturePrefab);
        knight2.getComponent('creature').init("Knight", 3, 100, 3, 1);
        knight2.setPosition(this.tiled.toPixelLoc(0, 2));
        knight2.getComponent(cc.Sprite).spriteFrame = c1;
        this.node.addChild(knight2);
        
        
        var url2 = cc.url.raw('resources/graphics/creature/creature2.png');
        var c2 = new cc.SpriteFrame(url2, cc.Rect(0, 0, 329, 337), false, 0, cc.Size(100, 100));
        
        var archer1 = cc.instantiate(this.creaturePrefab);
        archer1.getComponent('creature').init("Archer", 3.5, 100, 2, 3);
        archer1.setPosition(this.tiled.toPixelLoc(12, 3));
        archer1.getComponent(cc.Sprite).spriteFrame = c2;
        this.node.addChild(archer1);
        
        var archer2 = cc.instantiate(this.creaturePrefab);
        archer2.getComponent('creature').init("Archer", 3.5, 100, 2, 3);
        archer2.setPosition(this.tiled.toPixelLoc(12, 1));
        archer2.getComponent(cc.Sprite).spriteFrame = c2;
        this.node.addChild(archer2);
    },
    
    // 点击结束事件
    onTouchEnded:function(touch, event){
        cc.log('touch end');
    }
});