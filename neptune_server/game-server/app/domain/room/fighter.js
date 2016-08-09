var logger = require('pomelo-logger').getLogger(__filename);
var app = require('pomelo').app;
var pomelo = require('pomelo');

/**
 * 玩家
 * @type {*|void}
 */
var Fighter = app.BaseClass.extend({
  /**
   * 构造函数
   */
  ctor: function(data){
    this._super();
    this.JS_Name = "Player";
    this.uid = data.uid;
    this.data = data; // fightPlayer
    this.hasJoin = false;  // 是否已经加入房间
    this.isPrepare = false; // 是否已经准备好战斗
  },

  emit: function (route, msg) {
    app.get('statusService').pushByUids([this.uid], route, msg, this.errHandler.bind(this));
  },

  errHandler: function (err, fails) {
    if (!!err) {
      logger.error('Push Message error! %j', err.stack);
    }
  },
  /**
   * 进场
   */
  join: function(){
    if (this.hasJoin)
      return false;

    this.hasJoin = true;
    return true;
  },

  /**
   * 离场
   */
  leave: function(){
    if (!this.hasJoin)
      return false;

    this.hasJoin = false;
    return true;
  }
});


/**
 * 绑定模块外部方法
 */
module.exports = Fighter;