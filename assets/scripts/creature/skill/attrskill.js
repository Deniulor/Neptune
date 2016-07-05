var battleTiled = require('battleTiled');
var splitskill = cc.Class({
    extends: require('effectskill'),

    effect:function(){
        

        // 播放特效
        // this.creature.play(this.data.animation);
        if(this.creature.curRound == this.data.everytrigger){
            this.creature.addAttrValue(this.data.attrtype,this.data.attrvalue);
            this.creature.curRound = 0;
        }
        
        return true;
    },
});

module.exports = splitskill;