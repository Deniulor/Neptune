
    /// 基础函数 - 获取两个点坐标之间的路径
    getPath:function(from, to, filter){
        var node = function(p_parent, loc_x, log_y, g){
            this.distance = function(){
                var du = Math.abs(this.y - to.y);
                var dv = Math.abs(-Math.ceil(to.y / 2) + to.x + Math.ceil(this.y / 2) - this.x);
                var dw = Math.abs(-to.y + Math.ceil(to.y / 2) - to.x + this.y - Math.ceil(this.y / 2) + this.x);
                return  Math.max(Math.max(du, dv), dw);
            };
            this.parent = p_parent;
            this.x = loc_x;
            this.y = log_y;
            this.valueG = g;
            this.valueH = this.distance();
        };
        
        var open = [];
        open.push(new node(null, from.x, from.y, 0));
        var closed = [];
        while(open.length > 0){
            var n = open.length - 1;
            for(var o = open.length - 2; o >= 0; o -- ){
                if(open[n].valueG + open[n].valueH > open[o].valueG + open[o].valueH){
                    n = o;
                }
            }
            var curnode = open.splice(n, 1)[0];
            closed.push(curnode);
            if(this.search(closed, to.x, to.y) !== null){
                break;
            }
            var round = this.getRound(curnode.x, curnode.y);
            for(var i = round.length - 1; i >= 0; i -- ){
                var r = round[i];
                if(r.x < 0 || r.x >= 15 // x 越界
                    || r.y < 0 || r.y >= 7){ //y 越界
                    continue;
                }
                if(filter && filter(r.x, r.y)){
                    continue;
                }
                if(this.search(closed, r.x, r.y) !== null){
                    continue; // 已经遍历过了
                }
                var nodeInOpen = this.search(open, r.x, r.y);
                var tg = curnode.valueG + 1;
                if(nodeInOpen === null){
                    open.push(new node(curnode, r.x, r.y, tg));
                } else {
                    if(nodeInOpen.valueG > tg){
                        nodeInOpen.valueG = tg;
                        nodeInOpen.parent = curnode;
                    }
                }
            }
        }
        var targetNode = this.search(closed, to.x, to.y);
        var path = [];
        while(targetNode !== null){
            path.push(targetNode);
            targetNode = targetNode.parent;
        }
        path.reverse();
        return path;
    },

    // 将已选择的单位移动到相应点
    moveto:function(to_x, to_y){
        var from = this.toHexagonLoc();
        var self = this;
        var path = this.getPath(from, cc.p(to_x,to_y), function(x, y){
            var tileGid = self.goundLayer.getTileGIDAt(x, 6 - y);
            //var prop = this.map.getPropertiesForGID(tileGid);
            //if(prop.collidable != "true"){
            if(tileGid != 1){
                return true; // 不可行动点
            }
            var unit = self.getUnitOn(x, y);
            if(unit !== null && unit != self.selected){
                true; // 不允许穿人
            }
        });
        if(!path || path.length <= 0){
            cc.log("没有找到出路");
            return;
        }
        for(var i = 0; i < path.length; ++i){
            path[i] = cc.moveTo(0.05, path[i].x * 60 + 40, path[i].y * 80 + (path[i].x + 1) % 2 * 40); 
        }
        this.selected.getComponent('unit').onMoved();
        this.selected.runAction(cc.sequence(path));
    },
    
    // 用已选择单位攻击指定的单位
    attack:function(target){
        var from = this.toHexagonLoc(this.selected.getPosition());
        var to = this.toHexagonLoc(target.getPosition());
        
        var self = this;
        var path = this.getPath(from, to, function(x, y){
            var tileGid = self.goundLayer.getTileGIDAt(x, 6 - y);
            //var prop = this.map.getPropertiesForGID(tileGid);
            //if(prop.collidable != "true"){
            if(tileGid != 1){
                return true; // 不可行动点
            }
            var unit = self.getUnitOn(x, y);
            if(unit !== null && unit != self.selected){
                true; // 不允许穿人
            }
        });
        
        do{
            var p = path.pop();
        } while(this.funcLayer.getTileGIDAt(p.x, 6 - p.y) == 4);
        
        for(var i = 0; i < path.length; ++i){
            path[i] = cc.moveTo(0.05, path[i].x * 60 + 40, path[i].y * 80 + (path[i].x + 1) % 2 * 40); 
        }
        path.push(cc.moveTo(0.05, p.x * 60 + 40, p.y * 80 + (p.x + 1) % 2 * 40));
        
        var jump = cc.jumpTo(0.5,to.x * 60 + 40,to.y * 80 + (to.x + 1) % 2 * 40,30,1);
        path.push(jump);
        var atk = cc.spawn(cc.sequence(cc.rotateBy(0.1,10,10),cc.rotateBy(0.1,-10,-10),cc.rotateBy(0.1,10,10),cc.rotateBy(0.1,-10,-10)));
        path.push(atk);
        path.push(cc.moveTo(0.5, p.x * 60 + 40, p.y * 80 + (p.x + 1) % 2 * 40));
        if(this.selected.zIndex != target.zIndex){
            let max = Math.max(this.selected.zIndex, target.zIndex);
            let min = Math.min(this.selected.zIndex, target.zIndex);
            this.selected.zIndex = max;
            target.zIndex = min;
        } else {
            this.selected.zIndex ++;
        }
        path.push(cc.callFunc(function(){
            target.getComponent('unit').onDamage(30)
        }));
        this.selected.getComponent('unit').onMoved();
        this.selected.runAction(cc.sequence(path));
    },
