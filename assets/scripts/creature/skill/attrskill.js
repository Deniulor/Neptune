var battleTiled = require('battleTiled');
var splitskill = cc.Class({
    extends: require('effectskill'),

    effect:function(){
        // if(this.creature.curRound == this.data.everytrigger){//下个版本优化
            // 播放特效
            this.creature.play(this.data.animation);
            this.creature.addAttrValue(this.data.attrtype, this.data.attrvalue);
            this.creature.curRound = 0;
            return true;
        // } else {
        //     return false;
        // }
        
    },
});

module.exports = splitskill;