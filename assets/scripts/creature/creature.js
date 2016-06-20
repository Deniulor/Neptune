var battleTiled = require('battleTiled');
var dataApi = require('dataApi');

cc.Class({
    extends: cc.Component,

    init:function(battle, camp = 'red', data, loc){  
        this.battle = battle;
        this.camp = camp;

        this.MaxHP = data.hp;
        this.HP = data.hp;
        this.showHP = this.HP;
        this.Mov = data.mov;
        this.Rng = data.rng;
        this.Atb = data.atb;
        this.Atk = data.atk;
        this.curAtb = data.atb * Math.random() + 0.1;
        this.type = data.type;

        var movmode = require(data.movmode);// 返回的是一个类
        this.movmode = new movmode();
        this.movmode.creature = this;
        this.movmode.battle = battle;

        var atkmode = require(data.atkmode);
        this.atkmode = new atkmode();
        this.atkmode.creature = this;
        this.atkmode.battle = battle;

        this.skill = [];
        for(var i = 0; i<3 ; ++i){
            var skl = data['skill_' + i];
            skl = dataApi.skills.findById(skl);
            if(!skl){
                continue;
            }
            // skl = require();
            this.skill.push(skill);
        }

        this.node.setPosition(loc);

        var url = cc.url.raw('resources/graphics/creature/' + data.icon + '.png');
        this.node.getChildByName('Sprite').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(url);
        if(camp === 'red'){
            this.node.getChildByName('Sprite').getChildByName('camp').color = cc.color(255,0,0);
        } else { // camp === 'player2'
            this.node.getChildByName('Sprite').getChildByName('camp').color = cc.color(0,0,255);
        }
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var atb = this.getATB();
        var str;
        if(atb > 0){
            str = cc.js.formatStr("ATB:%s", atb.toFixed(1));
        }else {
            str = "Ready";
        }
        this.node.getChildByName("Label").getComponent(cc.Label).string = str;
        if(this.showHP >=0 && this.showHpDuration !== undefined && this.showHpDuration > 1e-6){
            this.showHP = this.showHP - (this.showHP - this.HP) / this.showHpDuration * dt;
            this.showHpDuration -= dt;
            if(this.showHP <= 0){
                this.showHP = 0;
                this.showHpDuration = 0;
                var fadeOut = cc.fadeOut(2);
                var finish = cc.callFunc(this.change, this);
                var fadeIn = cc.fadeIn(0.1);
                this.battle.checkIfWinner();
                this.node.runAction(cc.sequence(fadeOut,finish,fadeIn));
                this.icon.runAction(cc.fadeOut(2));
            }
        }
        if(this.showHP - this.HP < 1){
            this.showHP = this.HP;
        }
        this.node.getChildByName("HpBar").getComponent(cc.ProgressBar).progress = this.showHP / this.MaxHP;
    },
    
    getATB: function(){
        return this.curAtb;
    },
    
    turnEnd: function(){
        this.curAtb = this.Atb;
        this.battle.node.getChildByName('atbBar').getComponent('atbBar').stop = false;
    },

    showCreature:function(panel){
        panel.getChildByName('camp').color = this.node.getChildByName('Sprite').getChildByName('camp').color;
        for (var i = 1; i <= 3; i++) {
            panel.getChildByName('skill' + i).active = false;
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
        this.movmode.showMovable();
    },
    
    showAttack:function(){
        this.atkmode.showAttack();
    },
    
    moveto:function(to_x, to_y){
        this.movmode.moveto(to_x, to_y);
        this.action = 'moving';
    },

    // 用已选择单位攻击指定的单位
    attack:function(target){
        this.atkmode.attack(target);
        this.turnEnd();
    },

    onDamage: function(damage){
        this.HP -= damage;
    },
    
    runDamageAction:function(){
        this.showHpDuration = this.showHPDuration | 0.5;
        this.showHpDuration += 0.5;
    },
    
    change: function(){
        var tnode = this.node;
        tnode.getChildByName("HpBar").active = false; 
        cc.loader.loadRes("graphics/creature/skeleton", cc.SpriteFrame, function (err, spriteFrame) {
            var sprite = tnode.getChildByName('Sprite');
            sprite.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            sprite.width *= 0.8;
            sprite.height *= 0.8;
        });
    }
});
