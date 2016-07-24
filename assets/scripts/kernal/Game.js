cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
        var system = window || global;
        system.npt = {};

        // 初始化各个基础模块
        npt.data = require('Data')();
        npt.storage = require('Storage')();
        npt.audio = require('Audio')();
    },
});