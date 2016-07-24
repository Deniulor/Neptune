cc.Class({
    extends: cc.Component,

    properties: {
        Item_Count:{
            default:0,
            tooltip:"Item 数量"
        },
        Item_Width:{
            default:0,
            tooltip:"每个 Item 的宽度"
        },
        Item_Height:{
            default:0,
            tooltip:"每个 Item 的高度"
        },
        Item_MoveDis:{
            default:5,
            tooltip:"设定触发翻页的距离(像素)"
        },
        pageSound: {
            default: null,
            url: cc.AudioClip
        },
        unitPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    // use this for initialization
    onLoad: function () {
        this.Item_Count = npt.data.creatures.ids.length;
        this.init(this.Item_Count);
        // cc.log(this.Item_Count);
        this.pLayoutNode = this.node.getChildByName("pLayout");
        this.pLayout= this.pLayoutNode.getComponent(cc.Layout);
        
        this.pageIndex = 0;
        this.startVecPos =new cc.Vec2(0,0),
        
        this.node.getComponent(cc.Mask).enabled =true;

        var p1 =0;
        var p2 =0;
        switch(this.pLayout.type){
            case cc.Layout.Type.NONE:
                console.error("不支持无方向的Layout");
                break;
            case cc.Layout.Type.HORIZONTAL:
                p1 =this.Item_Count*0.5*(this.Item_Width+this.pLayout.spacingX)-(this.Item_Width+this.pLayout.spacingX)*0.5;
                p2 =0;
                break;
            case cc.Layout.Type.VERTICAL:
                p1 =0;
                p2 =this.Item_Count*0.5*(this.Item_Height+this.pLayout.spacingY)-(this.Item_Height+this.pLayout.spacingY)*0.5;
                break;
        }
       this.pLayoutNode.setPosition(p1,p2);
        
        // var touchStart =function (event){
        //   this.startVecPos =event.touch.getLocation();
        // };
        // this.node.on(cc.Node.EventType.TOUCH_START,touchStart,this); 
        
        // var touchEnd =function (event){
        //     var eP = 0;
        //     var sP = 0;
        //     switch(this.pLayout.type){
        //         case cc.Layout.Type.NONE:
        //             console.error("不支持无方向的Layout");
        //             break;
        //         case cc.Layout.Type.HORIZONTAL:
        //             eP = event.touch.getLocation().x;
        //             sP = this.startVecPos.x;
        //             break;
        //         case cc.Layout.Type.VERTICAL:
        //             eP = event.touch.getLocation().y;
        //             sP = this.startVecPos.y;
        //             break;
        //     }
        //     if(Math.abs(eP - sP) >= this.Item_MoveDis){
        //         if(eP > sP){
        //             if(this.pageIndex>=1){
        //                 this.pageIndex-=1;
        //                 this.doAction(0);
        //             }
        //         }else{ 
        //             if(this.pageIndex<this.Item_Count-1){
        //                 this.pageIndex+=1;
        //                 this.doAction(1);
        //             }
        //         }
        //     }
        // };
        // this.node.on(cc.Node.EventType.TOUCH_END,touchEnd,this); 
        
    },
    init:function(count) {
        this.pLayoutNode = this.node.getChildByName("pLayout");
        for(var i = 1; i <= count; ++i){
             var unit = cc.instantiate(this.unitPrefab);
             var p = cc.p((i-count/2)*this.Item_Width-0.5*this.Item_Width,0);
             unit.getComponent('unit').init(dataApi.creatures.findById(i),p);
             this.pLayoutNode.addChild(unit);
        }
    },
    playPageSound: function () {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.pageSound, false)
    },
    doAction1:function(dir){
        if(this.pageIndex>=this.Item_Count-1){
            return;
        }
        this.pageIndex+=1;
        var p1 = 0;
        var p2 = 0;
        switch(this.pLayout.type){
            case cc.Layout.Type.NONE:
                console.error("不支持无方向的Layout");
                break;
            case cc.Layout.Type.HORIZONTAL:
                
                p1 = -this.Item_Width-this.pLayout.spacingX;
                
                p2 = 0;
                break;
            case cc.Layout.Type.VERTICAL:
                p1 = 0;
                
                p2 = -this.Item_Height-this.pLayout.spacingY;
                
                break;
        }
        this.pLayoutNode.runAction(cc.moveBy(0.1,p1, p2));
        this.playPageSound();
    },
    doAction2:function(dir){
        if(this.pageIndex<1){
            return;
            }
        this.pageIndex-=1;
        var p1 = 0;
        var p2 = 0;
        switch(this.pLayout.type){
            case cc.Layout.Type.NONE:
                console.error("不支持无方向的Layout");
                break;
            case cc.Layout.Type.HORIZONTAL:
                
                    p1 = this.Item_Width+this.pLayout.spacingX;
                
                p2 = 0;
                break;
            case cc.Layout.Type.VERTICAL:
                p1 = 0;
                
                    p2 = this.Item_Height+this.pLayout.spacingY;
                
                break;
        }
        this.pLayoutNode.runAction(cc.moveBy(0.1,p1, p2));
        this.playPageSound();
    },
    
});
