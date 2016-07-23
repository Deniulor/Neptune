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

        var sprite = this.node.getChildByName('creature').getChildByName('portrait').getComponent(cc.Sprite);
        // 加载 SpriteFrame
        cc.loader.loadRes('graphics/creature/' + data.icon, cc.SpriteFrame, function (err, spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        });

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
        var self = this;
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
                
                this.node.runAction(cc.sequence(fadeOut,finish,fadeIn,cc.callFunc(function () {
                self.battle.checkIfWinner();
                })));
                this.icon.runAction(cc.spawn(cc.moveBy(2, cc.p(0, -40) ), cc.fadeOut(2)));
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
            this.cloneCreature('Reproduction');
        }
        if(this.waitRound > 0){
            this.waitRound--;
            this.turnEnd();
        }
        if(this.HP <= 0){
            this.turnEnd();
        }
    },
    cloneCreature :function(animation) {
        var actions = [];
        var self = this;
        var newborn_node = cc.instantiate(this.battle.creaturePrefab);
        var newborn = newborn_node.getComponent('creature');
        var randomLoc = battleTiled.randPixelLoc();
        newborn_node.getChildByName('HpLab').active = false;
        newborn_node.getChildByName('creature').getChildByName('camp').active = false;
        newborn_node.getChildByName('creature').getChildByName('selected').active = false;
        newborn_node.getChildByName('creature').getChildByName('portrait').active = false;
        newborn.init(this.battle, this.camp, this.data, randomLoc);
        this.battle.addCreature(newborn.node);

        var delay = 1.5;
        actions.push(cc.sequence(cc.callFunc(function () {
            delay = newborn.play(animation);
        }), cc.delayTime(delay)));
        actions.push(cc.callFunc(function () {
            newborn_node.getChildByName('HpLab').active = true;
            newborn_node.getChildByName('creature').getChildByName('camp').active = true;
            // newborn_node.getChildByName('creature').getChildByName('selected').active = true;
            newborn_node.getChildByName('creature').getChildByName('portrait').active = true;
            self.reproduce = false;
            self.turnEnd();
        }));
        var seq = cc.sequence(actions);
        this.node.runAction(seq);
        return newborn;
    },
    getATB: function(){
        return this.curAtb;
    },

    turnEnd: function(){
        this.curAtb = this.Atb;
        this.battle.node.getChildByName('atbBar').getComponent('atbBar').stop = false;
        this.battle.setSelected(null);
        // this.battle.checkIfWinner();
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

        var self = this;
        var visit = function(x,y){
        	// cc.log('visit (%s, %s)', x, y);
            var c = self.battle.getCreatureOn(x,y);
            if(c == null) return false; // 无单位显示攻击区域
            c = c.getComponent('creature');
            if(c == self) return false; // 可以选择自己
            if(c.camp != self.camp) {
            	if(c.HP > 0) c.shining();
            	// cc.log('shining at (%s, %s)', x,y);
            	return false; // 敌方单位 可以被攻击
            }
            if(c.HP <= 0)  return false; // 己方单位
            return true;
        };

        this.movclass.moveto(to_x, to_y, function(){
        	// 可以被攻击的单位进行高亮
        	var from2 = battleTiled.toHexagonLoc(self.node.getPosition());
        	battleTiled.getArea(from2, self.Rng, visit)
        });
        this.action = 'moving';
        this.node.getChildByName('creature').getChildByName('selected').active = false;
    },

    // 用已选择单位攻击指定的单位
    attack:function(target){
        //隐藏单位攻击效果
        var self = this;
        var visit = function(x,y){
            var c = self.battle.getCreatureOn(x,y);
            if(c == null) return false; // 无单位显示攻击区域
            c = c.getComponent('creature');
            if(c == self) return false; // 可以选择自己
            if(c.camp != self.camp) {
            	c.stopShining();
            	// cc.log('stop shining at (%s, %s)', x,y);
            	return false; // 敌方单位 可以被攻击
            }
            if(c.HP <= 0)  return false; // 己方单位
            return true;
        };
        var from = battleTiled.toHexagonLoc(this.node.getPosition());
        battleTiled.getArea(from, this.Rng, visit)

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
            return 0;
        }
        var animator = this.animator;
        var delay =0;
        cc.loader.loadRes("sound/effects/" + animation, function (err, sound) {
            if(err){
                cc.log(err);
                return 0;
            }
            cc.audioEngine.playEffect(sound, false);
        });
        cc.loader.loadRes("animate/" + animation, function (err, clip) {
            if(err){
                cc.log(err);
                return 0;
            }
            
            animator.addClip(clip, animation);
            var itemAnimState = animator.getAnimationState(animation);
            delay = itemAnimState.duration;
            animator.play(animation);
            return delay;
        });
    },
    stop:function(animation){
    	this.animator.stop(animation);
    },
    shining:function(){
    	this.node.getChildByName('creature').getComponent(cc.Animation).play('shining');
    },
    stopShining:function(){
    	this.node.getChildByName('creature').getComponent(cc.Animation).stop('shining');
    	this.node.getChildByName('creature').opacity = 255;
    }
});
