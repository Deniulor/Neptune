var Battle = cc.Class({
    ctor: function () {
        this.name = "battle";
        this.red = [];
        this.blue = [];
        this.all = [];

        var self = this;
        // 加载 Prefab
        cc.loader.loadRes("prefab/skill", function (err, prefab) {
            self.skillPrefab = prefab;
        });
    },
    clear:function(){
        this.red.length = 0;
        this.blue.length = 0;
        this.all.length = 0;
    },
});

module.exports = function(){
    return new Battle();
}