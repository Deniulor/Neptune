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
        }
    },

    // use this for initialization
    onLoad: function () {
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
        
        var touchStart =function (event){
          this.startVecPos =event.touch.getLocation();
        };
        this.node.on(cc.Node.EventType.TOUCH_START,touchStart,this); 
        
        var touchEnd =function (event){
            var eP = 0;
            var sP = 0;
            switch(this.pLayout.type){
                case cc.Layout.Type.NONE:
                    console.error("不支持无方向的Layout");
                    break;
                case cc.Layout.Type.HORIZONTAL:
                    eP = event.touch.getLocation().x;
                    sP = this.startVecPos.x;
                    break;
                case cc.Layout.Type.VERTICAL:
                    eP = event.touch.getLocation().y;
                    sP = this.startVecPos.y;
                    break;
            }
            if(Math.abs(eP - sP) >= this.Item_MoveDis){
                if(eP > sP){
                    if(this.pageIndex>=1){
                        this.pageIndex-=1;
                        this.doAction(0);
                    }
                }else{ 
                    if(this.pageIndex<this.Item_Count-1){
                        this.pageIndex+=1;
                        this.doAction(1);
                    }
                }
            }
        };
        this.node.on(cc.Node.EventType.TOUCH_END,touchEnd,this); 
        
    },
    
    doAction:function(dir){
        var p1 = 0;
        var p2 = 0;
        switch(this.pLayout.type){
            case cc.Layout.Type.NONE:
                console.error("不支持无方向的Layout");
                break;
            case cc.Layout.Type.HORIZONTAL:
                if(dir == 1){
                    p1 = -this.Item_Width-this.pLayout.spacingX;
                }else{
                    p1 = this.Item_Width+this.pLayout.spacingX;
                }
                p2 = 0;
                break;
            case cc.Layout.Type.VERTICAL:
                p1 = 0;
                if(dir == 1){
                    p2 = -this.Item_Height-this.pLayout.spacingY;
                }else{
                    p2 = this.Item_Height+this.pLayout.spacingY;
                }
                break;
        }
        this.pLayoutNode.runAction(cc.moveBy(0.3,p1, p2));
    },
    
});
