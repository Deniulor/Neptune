cc.Class({
    extends: cc.Component,

    properties: {
        prefab: {
            default:null,
            type:cc.Prefab
        },
        presents: {
            default:null,
            type:cc.Node
        },
        creatures: {
            default:null,
            type:cc.Node
        },
        ground:{
            default:null,
            type:cc.TiledLayer
        },
        buttonLabel:{
            default:null,
            type:cc.Label
        }
    },

    // use this for initialization
    onLoad: function () {
        if(typeof npt === 'undefined'){
            cc.director.loadScene('loading');
            return;
        }

        var all = npt.data.creatures.all();
        for (var i in all) {
            var creature = cc.instantiate(this.prefab);
            var data = all[i];
            creature.getComponent('creature').init(this.player, data, cc.p(0.0));
            this.presents.addChild(creature);

            creature.on('touchstart',this.startDragDisplay, this);
            creature.on('touchmove',this.moveDisplay, this);
            creature.on('touchend',this.endDragDisplay, this);
            creature.on('touchcancel',this.endDragDisplay, this);
        }

        this.player = 'red';
        for(var i = npt.tiled.MapHeight - 1; i >=0 ; --i){
            for(var j = npt.tiled.MapWidth - 1; j > npt.tiled.MapWidth / 2 - 1; --j){
                this.ground.setTileGID(0, cc.p(j, i));
            }
        }
        npt.battle.clear();
    },

    startDragDisplay:function(event){
        var current = event.getCurrentTarget();
        if(current.parent == this.presents){
            var data = current.getComponent('creature').data;
            current = cc.instantiate(current);
            current.getComponent('creature').init(this.player, data, cc.p(0.0));
            current.on('touchstart',this.startDragDisplay, this);
            current.on('touchmove',this.moveDisplay, this);
            current.on('touchend',this.endDragDisplay, this);
            current.on('touchcancel',this.endDragDisplay, this);
            this.creatures.addChild(current);
        } 
        this.moving = current;

        var loc = event.getLocation();
        loc = this.creatures.convertToNodeSpace(loc);
        this.moving.setPosition(loc);
        this.draggingDisplay = true;
    },
    moveDisplay:function(event){
        if(!this.moving){
            return;
        }

        var loc = event.getLocation();
        loc = this.creatures.convertToNodeSpace(loc);
        this.moving.setPosition(loc);
    },
    endDragDisplay:function(event){
        if(!this.moving){
            return;
        }
        var loc = npt.tiled.toHexagonLoc(this.moving.getPosition());
        if(!npt.tiled.isLocValid(loc) || this.ground.getTileGIDAt(cc.p(loc.x, 3 - loc.y)) === 0){
            this.moving.removeFromParent();
            this.moving = null;
            return;
        } 
        loc = npt.tiled.toPixelLoc(loc.x, loc.y);
        for (var i = this.creatures.children.length - 1; i >= 0; i--) {
            var child = this.creatures.children[i];
            if(child.getPositionX() == loc.x && child.getPositionY() == loc.y){
                child.removeFromParent();
            }
        }
        this.moving.setPosition(loc);
    },

    buttonClick:function () {
        if (this.player == 'red'){
            this.saveCreature('red');
            this.swithPlayer();
        } else {
            this.saveCreature('blue');
            cc.director.loadScene('battle');
        }
    },
    startLongTouch :function (event) {
        var self = this;
        var current = event.getCurrentTarget();
        var data = current.getComponent('creature').data;
        this.popDetail = false;
        this.touching = setTimeout(function (){
            self.popDetail = true;
            npt.battle.comp.showUnitDetail(data);
        }, 1000);
    },
    stopLongTouch:function(){
        clearTimeout(this.touching);
        npt.battle.comp.hideSkillDetail();
    },
    saveCreature: function(player) {
        for(var i = this.creatures.children.length - 1; i >= 0; --i){
            var data = this.creatures.children[i].getComponent('creature').data
            this.creatures.children[i].off('touchstart',this.startDragDisplay, this);
            this.creatures.children[i].off('touchmove',this.moveDisplay, this);
            this.creatures.children[i].off('touchend',this.endDragDisplay, this);
            this.creatures.children[i].off('touchcancel',this.endDragDisplay, this);
            npt.battle[player].push(this.creatures.children[i]);
            npt.battle.all.push(this.creatures.children[i]);
        }
        this.creatures.removeAllChildren(false);
    },
    swithPlayer:function(){
        this.player = 'blue';
        for(var i = npt.tiled.MapHeight - 1; i >=0 ; --i){
            for(var j = npt.tiled.MapWidth - 1; j >=0 ; --j){
                if(j > npt.tiled.MapWidth / 2){
                    this.ground.setTileGID(1, cc.p(j, i));
                } else {
                    this.ground.setTileGID(0, cc.p(j, i));
                }
            }
        }

        for(var i = this.presents.children.length - 1; i >= 0; --i){
            var creature = this.presents.children[i];
            creature.getChildByName('creature').getChildByName('camp').color = npt.config.blue;
        }
        this.buttonLabel.string = '开始战斗';
    },
});
