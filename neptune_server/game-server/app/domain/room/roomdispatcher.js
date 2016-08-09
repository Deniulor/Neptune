/**
 * Created by Deniulor on 2016/5/4.
 */
var logger = require('pomelo-logger').getLogger(__filename);
var app = require('pomelo').app;
var utilsDispatcher = require('../../util/dispatcher');
var co = require('co');
var Promise = require('bluebird');
var path = require('path');

var RoomDispatcher = app.BaseClass.extend({
  /**
   * 构造函数
   */
  ctor: function(){
    this._super();
    this.JS_Name = "RoomDispatcher";
    var self = this;
    this.interval = setInterval(function () {
      self.tryMatch();
    }, 1000);

    self.initParam();
  },

  initParam : function(){
    var cfg = require(path.join(app.getBase(), "config/roomDispatcher.json"));
    this.matchMap = {}; // {index:[joiner]} index 是积分对100取整
    this.poolLength = cfg.poolLength; //匹配池长度
    this.poolGapLength = cfg.poolGapLength;//一个匹配池中的间隔长度
    this.count = 0;
  },
  /**
   * 加入请求者
   * @param joiner
   */
  startMatch:function(joiner){
    try{
      var index = this.getIndex(joiner.rankPoint);
      //初始化匹配池
      var matchQueue = this.matchMap[index];
      if(!matchQueue){
        matchQueue = this.matchMap[index] = [];
      }
      //判断是否已经在匹配池
      for (var i = 0; i < matchQueue.length; i++) {
        if (matchQueue[i].uid == joiner.uid) {
          return ;
        }
      }

      //这个是玩家在第几论开始向上搜索其他池的选手，-1为第2论，0为第一轮
      joiner.matchCount = -1;
      matchQueue.push(joiner);
      logger.info('startMatch',joiner);
    }catch(e){
      console.error(e);
    }
  },

  /**
   * 删除请求者
   * @param joiner
   */
  cancelMatch:function(joiner) {
    try {
      var key = this.getIndex(joiner.rankPoint);
      //判断玩家是不是在匹配队列里面
      var matchQueue = this.matchMap[key];
      if (!matchQueue) {
        console.error("队列为空");
        return 0;
      }

      //取消玩家匹配
      for (var index = 0; index < matchQueue.length; index++) {
        if (matchQueue[index].uid == joiner.uid) {
          matchQueue.splice(index, 1);
          return 1;
        }
      }
      logger.info('cancelMatch', joiner);
      return 0;
    }catch(e) {
      logger.error(e);
    }
  },

  /**
   *  找出玩家对应的匹配池的key
   * @param rankPoint
   * @returns {number}
   */
  getIndex:function(rankPoint){
    try {
      var index = this.poolLength;
      if (rankPoint < (this.poolLength * this.poolGapLength)) {
        index = parseInt(rankPoint / this.poolGapLength);
      }
      return index;
    }catch (e){
      index = 0;
      logger.error(e);
    }
  },

  /**
   * 匹配算法
   *
   */
  tryMatch: function () {
    try {
      //为不同的匹配池进行匹配
      for (var index = this.count; index <= (this.poolLength + this.count); index++) {
        var realIndex = index <= this.poolLength ? index : (index - this.poolLength -1);
        var matchQueue = this.matchMap[realIndex];
        if(!matchQueue || matchQueue.length == 0){
          continue;
        }
        while (matchQueue.length >= 2) {
          var fighter1 = matchQueue.shift();
          var fighter2 = matchQueue.shift();
          this.startFight(fighter1, fighter2);
        }
        if (matchQueue.length == 1) {
          var waitFighter = matchQueue[0];
          if(waitFighter.matchCount < this.poolLength){
            waitFighter.matchCount += 1;
          }
          for(var i = 1; i <= waitFighter.matchCount; i++){
            var tempIndex =  (realIndex + i);
            var poolIndex = tempIndex <= this.poolLength ? tempIndex : (this.poolLength - i);
            var fightQueue = this.matchMap[poolIndex];
            if(fightQueue && fightQueue.length != 0){
              var player =  fightQueue.shift();
              waitFighter = matchQueue.shift();
              this.startFight(waitFighter, player);
              break;
            }
          }
        }
      }
      this.count = (this.count + 1) > this.poolLength ? 0 : (this.count + 1);
    }catch (e){
      console.error(e);
      logger.error(e);
    }
  },

  startFight :function(fighter1, fighter2){
    var self = this;
    co(function*(){
      try{
        //取出room服务器配置
        var rooms = app.getServersByType('room');
        if (!rooms) {
          logger.error('no room');
          return;
        }
        var roomServer = utilsDispatcher.dispatch(fighter1.uid + fighter2.uid, rooms);
        var roomInfo = yield self.queryRoom(roomServer.id, {u1:fighter1 ,u2:fighter2});
        var f1Ret = yield self.notifyRoomInfo(fighter1.serverID, fighter1.uid, roomInfo);
        var f2Ret = yield self.notifyRoomInfo(fighter2.serverID, fighter2.uid, roomInfo);
      }catch(e){
        console.error(e);
        logger.error(e);
      }
    });
  },

  /**
   * 请求战斗房间信息
   * @param roomID
   * @param queryInfo
   * @returns {bluebird|exports|module.exports}
   */
  queryRoom: function(roomID, queryInfo){
    return new Promise(function(resolve, reject){
      app.rpc.room.r02_roomRemote.r01_createRoom.toServer(roomID, queryInfo, function(info){
        resolve(info);
      });
    });
  },

  /**
   * 请求
   * @param serverID
   * @param notifyInfo
   * @returns {bluebird|exports|module.exports}
   */
  notifyRoomInfo: function(serverID, uid, notifyInfo) {
    return new Promise(function(resolve, reject){
      app.rpc.area.r11_rankRemote.r01_fightRoom.toServer(serverID, uid, notifyInfo, function(info){
        resolve(info);
      });
    });
  }
});

var _dispatcher = null;
/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
  if(!_dispatcher){
    _dispatcher = new RoomDispatcher();
  }
  return _dispatcher;
};