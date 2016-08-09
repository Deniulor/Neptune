/**
 * Created by Deniulor on 2016/5/4.
 */
var logger = require('pomelo-logger').getLogger(__filename);
var app = require('pomelo').app;
var pomelo = require('pomelo');
var Fight = require('./fight');

/**
 * 房间
 * @type {*|void}
 */
var Room = app.BaseClass.extend({
  /**
   * 构造函数
   */
  ctor: function(rid){
    this._super();
    this.JS_Name = "Room";
    this.rid = rid;
    this.uids = [];
    this.players = {};  // 参与者
    this.watchers = {};  // 观察者

    this.allPrepared = false;
    this.fight = new Fight(this); // 战斗模拟
  },

  init: function (player1, player2) {
    this.addPlayer(player1);
    this.addPlayer(player2);
    this.fight.init(player1, player2);
  },

  addPlayer: function(player){
    this.uids.push(player.uid);
    this.players[player.uid] = player;
    app.roomMgr.addPlayer(player.uid, this);
  },

  // 启动
  open: function(){
    this.fight.prepareStart();
  },

  // 关闭
  close: function(){
    this.fight.close();
  },

  onClose: function(result){
    var self = this;
    // 清理对象
    for (var index = 0; index < this.uids.length; index++){
      app.roomMgr.delPlayer(this.uids[index]);
    }

    app.roomMgr.removeRoom(this.rid);

    // 结算战斗奖励

    // 通知area服务器结果
    var notify = function(id) {
      var player = self.getPlayerByID(id);
      app.rpc.area.r11_rankRemote.r02_fightResult.toServer(player.data.serverID, player.uid, result, function(err, info){
      });
    }

    notify(1);
    notify(2);
  },

  // 房间基本信息
  getInfo: function(){
    return {
      roomServerID: app.getServerId(),
      roomID: this.rid,
    }
  },

  emit: function (route, msg) {
    app.get('statusService').pushByUids(this.uids, route, msg, this.errHandler.bind(this));
  },

  errHandler: function (err, fails) {
    if (!!err) {
      logger.error('Push Message error! %j', err.stack);
    }
  },


  /**
   * 玩家入场，请求当前场面消息
   * @param uid
   */
  joinAndQueryInfo: function(uid) {
    var player = this.players[uid];
    if (!player) {
      return {code:app.code.Fight.NoAbleFight, msg:'not in fight'};
    }

    var needNotify = player.join();
    if (needNotify){
      this.emit('on1102_Room_enter', {uid:uid, name:player.data.name});
    }
    return this.fight.getFightInfo();
  },

  /**
   * 玩家行动
   * @param uid
   * @param act
   * @param endPos
   * @param details
   */
  action: function(uid, msg){
    var actPlayer = this.getPlayerID(uid);
    if (-1 == actPlayer) {
      return {code:app.code.NoAbleRole};
    }
    return this.fight.action(actPlayer, msg);
  },

  actionDefense: function(uid, msg){
    var actPlayer = this.getPlayerID(uid);
    if (-1 == actPlayer) {
      return {code:app.code.NoAbleRole};
    }
    return this.fight.actionDefense(actPlayer, msg);
  },

  actionKick: function(uid, msg){
    var actPlayer = this.getPlayerID(uid);
    if (-1 == actPlayer) {
      return {code:app.code.NoAbleRole};
    }
    return this.fight.actionKick(actPlayer, msg);
  },

  actionIdle: function(uid, msg){
    var actPlayer = this.getPlayerID(uid);
    if (-1 == actPlayer) {
      return {code:app.code.NoAbleRole};
    }
    return this.fight.actionIdle(actPlayer, msg);
  },

  tempRoundStart: function(msg){
    var sync = this.fight.tryTempRoundStart(msg);
    if (sync) {
      this.emit('on1108_Fight_tempRoundStart', msg);
    }
    return {};
  },

  // uid->1,2
  getPlayerID: function(uid){
    var index = this.uids.indexOf(uid);
    if (index == -1 || index >= 2)
      return -1;

    return index+1;
  },

  // 1,2->player
  getPlayerByID: function(id) {
    var uid = this.uids[id-1];
    return this.players[uid];
  },

  /**
   * 用户放弃
   * @param uid
   * @returns {*}
   */
  giveUp: function(uid){
    var looser = this.getPlayerID(uid);
    if (-1 == looser){
      return false;
    }
    var winner = looser == 1? 2: 1;
    var ret = this.fight.close(winner);
    return ret;
  },

  prepareStart: function(uid){
    var player = this.players[uid];
    player.isPrepare = true;

    if (!this.allPrepared) {
      var prepared = true;
      for (var uide in this.players){
        player = this.players[uide];
        if (!player.isPrepare) {
          prepared = false;
          break;
        }
      }

      logger.info('prepareStart, uid', uid, prepared);
      // 全部准备好了，战斗开始
      if (prepared) {
        this.allPrepared = true;
        this.fight.start();
      }
    }
  }
});


/**
 * 绑定模块外部方法
 */
module.exports = Room;
