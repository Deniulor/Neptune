cc.Class({
    extends: cc.Component,

    onLoad: function () {
        this.initGame();
    },

    initGame: function () {
        var system = window || global;
        system.npt = {};

        // 初始化各个基础模块
        npt.data = require('Data')();
        npt.storage = require('Storage')();
        npt.audio = require('Audio')();
        npt.tiled = require('Tiled')();
        npt.battle = require('Battle')();
        npt.config = require('Config')();
    },
});
