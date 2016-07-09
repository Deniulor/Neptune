var battleTiled = require('battleTiled');
var dataApi = require('dataApi');

cc.Class({
    extends: cc.Component,

    init:function(battle, camp = 'red', data, loc){  
        this.battle = battle;
        this.camp = camp;
        this.data = data;

        this.MaxHP = data.hp;
        this.HP = data.hp;
        this.showHP = this.HP;
        this.Mov = data.mov;
        this.Rng = data.rng;
        this.Atb = data.atb;
        this.Atk = data.atk;
        this.curAtb = data.atb * Math.random() + 0.1;
        this.status = "null";
        var movclass = require(data.movclass);// 返回的是一个类
        this.movclass = new movclass();
        this.movclass.creature = this;
        this.movclass.battle = battle;
        this.id = data.id;
        var atkclass = require(data.atkclass);
        this.atkclass = new atkclass();
        this.atkclass.creature = this;
        this.atkclass.battle = battle;
        this.curRound = 0;
        // this.everytrigger = data.everytrigger;
        this.skill = [];
        for(var i = 1; i<=3 ; ++i){
            var skl = data['skill_' + i];
            if(!skl){
                continue;
            }
            skl = dataApi.skills.findById(skl);
            if(!skl){
                continue;
            }
            var skill = new (require(skl.sklclass))();
            skill.init(skl,this);
            this.skill.push(skill);
        }

        this.node.setPosition(loc);
        this.node.getChildByName("HpLab").getComponent(cc.Label).string = this.HP + "/" +this.MaxHP;

        var url = cc.url.raw('resources/graphics/creature/' + data.icon + '.png');
        this.node.getChildByName('creature').getChildByName('portrait').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(url);
        if(camp === 'red'){
            this.node.getChildByName('creature').getChildByName('camp').color = cc.color(229,113,113);
        } else { // camp === 'blue'
            this.node.getChildByName('creature').getChildByName('camp').color = cc.color(113,163,229);
        }

        this.animator = this.node.getChildByName('creature').getChildByName('animate').getComponent(cc.Animation);
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var atb = this.getATB();
        if(this.showHP >=0 && this.showHpDuration !== undefined && this.showHpDuration > 1e-6){
            this.showHP = this.showHP - (this.showHP - this.HP) / this.showHpDuration * dt;
            this.showHpDuration -= dt;
            if(this.showHP <= 0){
                this.showHP = 0;
                this.showHpDuration = 0;
                this.node.zIndex = 0;
                var fadeOut = cc.fadeOut(2);
                var finish = cc.callFunc(this.onDie, this);
                var fadeIn = cc.fadeIn(0.1);
                this.node.runAction(cc.sequence(fadeOut,finish,fadeIn));
                this.icon.runAction(cc.spawn(cc.moveBy(2, cc.p(0, -40) ), cc.fadeOut(2)));
                this.battle.checkIfWinner();
            }
        }
        if(this.showHP - this.HP < 1){
            this.showHP = this.HP;
        }
        if(this.showHP !== null && this.showHP !== undefined){
            this.node.getChildByName("HpLab").getComponent(cc.Label).string = this.showHP.toFixed(0) + "/" +this.MaxHP;
        }
    },
    
    onDie: function(){
        var tnode = this.node;
        tnode.getChildByName('creature').getChildByName('camp').active = false;
        cc.loader.loadRes("graphics/creature/skeleton", cc.SpriteFrame, function (err, spriteFrame) {
            var sprite = tnode.getChildByName('creature').getChildByName('portrait');
            sprite.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
    },

    onTurnBegin:function(){
        this.action = 'move';
        this.setSkillUsed(false);
        
        if(this.status=="bleeding"){
            this.onDamage(2);
            this.setStatus("null");
            this.runDamageAction();
        }
        this.curRound ++;
        if(this.reproduce == true){
            var newborn = cc.instantiate(this.battle.creaturePrefab);
            newborn = newborn.getComponent('creature');
            newborn.init(this.battle, this.camp, this.data, battleTiled.randPixelLoc());
            newborn.play('dark');
            this.battle.addCreature(newborn.node);

            this.reproduce = false;
            this.turnEnd();
        }
        if(this.waitRound > 0){
            this.waitRound--;
            this.turnEnd();
        }
        if(this.HP <= 0){
            this.turnEnd();
        }
    },
    
    getATB: function(){
        return this.curAtb;
    },

    turnEnd: function(){
        this.curAtb = this.Atb;
        this.battle.node.getChildByName('atbBar').getComponent('atbBar').stop = false;
        this.battle.setSelected(null);
        this.battle.checkIfWinner();
    },

    showCreature:function(panel){
        panel.getChildByName('camp').color = this.node.getChildByName('creature').getChildByName('camp').color;
        var skillPanel = panel.getChildByName('skillLayout');
        skillPanel.removeAllChildren(false);

        for(var i = 0; i < this.skill.length; ++i){
            let skill = this.skill[i];
            skillPanel.addChild(skill.node);
        }
    },
    
    showAction:function(){
        if(this.curAtb > 0 ){
            return;
        }
        if(this.action == 'move'){
            this.showMovable();
        } else if(this.action == 'attack'){
            this.showAttack();
        }
    },
    
    showMovable:function(){
        this.movclass.showMovable();
    },
    
    showAttack:function(){
        this.atkclass.showAttack();
    },
    
    moveto:function(to_x, to_y){
        var from = battleTiled.toHexagonLoc(this.node.getPosition());
        if(from.x == to_x && from.y == to_y){
            this.action = 'attack';
            return;
        }

        this.movclass.moveto(to_x, to_y);
        this.action = 'moving';
        this.node.getChildByName('creature').getChildByName('selected').active = false;
    },

    // 用已选择单位攻击指定的单位
    attack:function(target){
        if(target == this){
            this.turnEnd();
            return;
        }
        this.atkclass.attack(target);
        this.turnEnd();
    },
    onDamage: function(damage){
        this.HP -= damage;
        if(this.HP < 0){
            this.HP = 0;
        }
    },
    addAttrValue:function(type,value){
        if(type == "HP"){
            this.HP += value;
            this.MaxHP += value;
        }
        if(type == "ATK"){
            this.Atk += value;
        }
        this.runDamageAction();
    },

    setSkillUsed:function(value){
        this.skillUsed = value;
        for(var i = 0; i < this.skill.length ; ++i){
            this.skill[i].node.getChildByName('lock').active = value;
        }
    },

    setStatus: function(status){
        this.status = status;
    },
    runDamageAction:function(){
        this.showHpDuration = this.showHPDuration | 0.5;
        this.showHpDuration += 0.5;
    },

    getHexLoc:function(){
        return battleTiled.toHexagonLoc(this.node.getPosition());
    },

    play:function(animation){
        if(this.animator.play(animation)){
            return;
        }
        var animator = this.animator;
        cc.loader.loadRes("animate/" + animation, function (err, clip) {
            if(err){
                cc.log(err);
                return;
            }
            animator.addClip(clip, animation);
            animator.play(animation);
        });
    },
});
