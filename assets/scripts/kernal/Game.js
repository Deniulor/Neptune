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

        // npt.net = require('net')();
        // npt.sceneMgr = require('SceneMgr');
        // npt.uiMgr = require('UIMgr');
        // npt.msgBoxMgr = require('MsgBoxMgr');
        // npt.toolMgr = require('ToolMgr');
        // npt.keyWordMgr = require('KeyWordMgr');
        // npt.rankMgr = require('RankMgr').init();
        // npt.hookMgr = require('HookMgr').init();
        // npt.debugMgr = require('DebugMgr').init();
        // npt.effectMgr = require('EffectMgr');
    },
});