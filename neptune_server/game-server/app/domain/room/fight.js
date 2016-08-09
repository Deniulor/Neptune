/*
 *  fight.js
 *
 *  author:Clark
 *  date:2016/6/21
 */


var logger = require('pomelo-logger').getLogger(__filename);
var app = require('pomelo').app;
var co = require('co');
var BattleLogic = require('./battle/BattleLogic');

var RoundTime = 15;
var KickRoundTime = 10;
var FightTime = 180;
var WinGoal = 2;
var MaxPrepareTime = 20*1000;
var KickTimes = 10;

var State = {
    Prepare: 0,  // 准备阶段
    Playing: 1,  // 进行中
    Kick: 2,     // 点球5轮
    Endless: 3,  // 无尽点球
    End: 4,      // 结束
}

var Direction = {
    Middle: 0,  // 中间
    Left: 1,    // 左
    Right: 2,   // 右
}

/**
 *  服务器启动管理器定义
 */
var fight = app.BaseClass.extend({
    
    /**
     * 构造函数
     */
    ctor: function(room){
        this._super();
        this.JS_Name = "fight";
        this.room = room;

        // 赛场状态
        this.state = State.Prepare;

        this.createTime = null; // 创建时间

        this.winner = 0; // 1或2
        this.startTime = null; // 开始时间
        this.actors = {}; // 场上球员、足球，信息
        this.player1 = null;
        this.player2 = null;

        // 回合信息
        this.round = 0;
        this.roundPlayer = 0; // 1或2
        this.roundStartTime = null; // 回合开始时间
        this.roundActTime = null; // 回合操作时间
        this.roundActLastTime = 0; // 回合操作持续时间

        // 正常比赛时间规则记录
        this.roundGoalPlayer = 0; // 上回合得分者，用于控制下回合丢分者发球
        this.isFirstShot = true; // 是否是第一次进球
        this.recentAction = {}; // 最近的一次行为，包含动作结束后的场上状态
        this.lastActionFoul = false // 上回合是否犯规；
        this.roundStartInfo = {}; // 最近的回合开始信息
        this.onceAgainSid = 0;  // 下回合强制行动的球员

        // 点球大赛回合数
        this.kickRound = 0;
        this.defenseDirection = 0;
    },

    /**
     * 初始化
     * @param player1
     * @param player2
     */
    init: function(player1, player2){
        this.player1 = player1;
        this.player2 = player2;
        this.battle = new BattleLogic(player1.data, player2.data);
    },

    // 获取战场信息
    getFightInfo: function(){
        return {
            state: this.state,
            player1: this.player1.getResultInfo(),
            player2: this.player2.getResultInfo(),
            actors: this.actors,
            leftSec: this.getLeftSec(),
            roundPlayer: this.roundPlayer,
            roundLeftSec: this.getRoundLeftSec(),
            recentAction: this.recentAction,
            roundStartInfo: this.roundStartInfo,
            onceAgainSid: this.onceAgainSid,
            kickRound: this.kickRound
        }
    },

    /**
     * 开始
     */
    prepareStart: function(){
        var self = this;
        this.createTime = new Date();

        self._update = setTimeout(function(){
            self.start();
        }, MaxPrepareTime);
    },

    /**
     * 启动
     */
    start: function(){
        logger.error('start');
        if (this.startTime)
            return false;

        var self = this;
        self.state = State.Playing;
        this.startTime = new Date();
        self.nextRound(); // 初始化，第一帧
        self._update = setInterval(function(){
            if (self.state == State.Playing)
                self.update();
            else if (self.state == State.Kick || self.state == State.Endless)
                self.updateKick();
        },1000);
        return true;
    },

    // 进入点球阶段
    enterKick: function(){

        logger.info('enterKick');

        this.state = State.Kick;
        this.roundPlayer = 1; // 强制为1号，则nextRound为2号首发点球
        this.kickRound = 0;
        this.roundStartTime = null;
        this.roundActTime = null;
        this.roundActLastTime = 0;

        this.room.emit("on1110_Fight_startKick", {});
        var self = this;
        setTimeout(function(){
            self.nextKickRound();
        },3000)
    },

    // 每s更新常规战斗
    update: function(){
        var curTime = new Date();

        // 总剩余时间
        var totalLeftSec = this.getLeftSec();

        // 正在执行一个回合，判断执行操作后，进入下一回合,以及战斗结果、超时判断
        if (this.roundActTime) {
            var leftSec = Math.max(0, this.roundActLastTime - (curTime.getTime() - this.roundActTime.getTime()) / 1000);
            // 回合操作执行完毕
            if (leftSec == 0) {
                // 判断比分
                logger.info(this.player1.goal, this.player2.goal);
                if (this.player1.goal >= WinGoal) {
                    this.close(1);
                    return;
                }
                if (this.player2.goal >= WinGoal) {
                    this.close(2);
                    return;
                }

                // 判断整体超时
                if (totalLeftSec == 0) {
                    this.calcClose();
                    return;
                }
                // 还没结束，进入下一回合
                this.nextRound();
            }
        }
        // 不在回合操作中
        else {
            // 回合等待操作，但是总体超时
            if (totalLeftSec == 0) {
                this.calcClose();
                return;
            }

            // 回合等待操作, 本轮操作过期
            var leftSec = Math.max(0, RoundTime - (curTime.getTime() - this.roundStartTime.getTime()) / 1000);
            if (leftSec == 0) {
                this.nextRound();
            }
        }
    },

    // 点球阶段的timer
    updateKick: function(){

        if (!this.roundStartTime)
            return;

        var curTime = new Date();

        // 正在执行一个回合，判断执行操作后，进入下一回合,以及战斗结果、超时判断
        if (this.roundActTime) {
            var leftSec = Math.max(0, this.roundActLastTime - (curTime.getTime() - this.roundActTime.getTime()) / 1000);
            // 回合操作执行完毕
            if (leftSec == 0) {

                // 自由球分出胜负
                if (this.checkEndless())
                    return;

                if (this.miss) {
                    this.room.emit('on1114_Fight_kickActionMiss', {});
                    this.close(this.miss == 1?2:1);
                    return;
                }

                // 还没结束，进入下一回合
                this.nextKickRound();
            }
        }
        // 不在回合操作中
        else {
            // 回合等待操作, 本轮操作过期
            var leftSec = Math.max(0, KickRoundTime - (curTime.getTime() - this.roundStartTime.getTime()) / 1000);
            if (leftSec == 0) {

                // 自由球分出胜负
                if (this.checkEndless())
                    return;

                // 射球不作为
                if (this.kickRound % 2 == 0){
                    var player = this.getPlayer(this.roundPlayer);
                    player.setKickGoal(this.kickRound, 0);

                    // 无尽模式，直接判输
                    if (this.isEndless()) {
                        this.room.emit('on1114_Fight_kickActionMiss', {});
                        player.setEndlessMiss();
                        this.close(this.roundPlayer == 1 ? 2: 1);
                        return;
                    }
                }

                this.nextKickRound();
            }
        }
    },

    getPlayer: function(act){
        if (act == 1)
            return this.player1;
        else return this.player2;
    },

    // 判断第一阶段300s的结果
    calcClose: function(){
        var winner = 0;
        if (this.player1.goal > this.player2.goal)
            winner = 1;
        if (this.player1.goal < this.player2.goal)
            winner = 2;

        // if (winner > 0) {
        //     this.close(winner);
        // }
        // else {
        //     this.enterKick();
        // }
            this.close(winner);
    },



    // 结算 winner 1或2
    close: function(winner){
        // 已经结束了
        if (this.state == State.End)
            return false;
        this.state = State.End;

        // 清理定时器
        if (this._update){
            clearTimeout(this._update);
        }

        if (winner){
            this.winner = winner;
        }

        // 奖励结算
        var result = {
            player1: this.player1.getResultInfo(),
            player2: this.player2.getResultInfo(),
            winner: winner,
        }
        this.room.onClose(result);
        return true;
    },

    // 结算 winner 1或2
    actionIdle: function(actPlayer, msg){
        this.room.emit('on1114_Fight_idle', msg);
        return true;
    },

    /**
     * 执行动作
     * @param actPlayer 1/2
     * @param act
     * @param endPos
     * @param details
     * @returns {boolean}
     */
    action: function(actPlayer, act){
        // 判断是否为当前回合行动者
        if (actPlayer != this.roundPlayer) {
            var msg = "you are not roundPlayer, you are " + actPlayer;
            return {code:app.code.Fight.NotRoundPlayer, msg: msg};
        }
        // 当前回合已经行动过
        if (this.roundActTime) {
            var msg = "already has action";
            return {code:app.code.Fight.NotRoundPlayer, msg: msg};
        }
        // 当前回合有强制操作的球员
        if (this.onceAgainSid > 0 && this.onceAgainSid != act.act.sid){
            var msg = "curForceSid：" + this.onceAgainSid;
            return {code:app.code.Fight.RoundForceSid, msg: msg};
        }

        logger.info('act:', act);
        var act = this.battle.actionServerHandle(act);
        this.roundActLastTime = Math.max(0, act.endTime + (act.goal > 0 ? 1:0)); // 当前动作执行时间, 进球+1秒
        act.round = this.round; // 回合数
        act.foul = 0; // 犯规者
        act.actPlayer = actPlayer;  // 动作发起者

        try {
            this.roundActTime = new Date();
            // 有可能进球
            if (act.goal > 0) {
                // 判断犯规进球
                if (this.isFirstShot) {
                    act.foul = actPlayer;
                    this.lastActionFoul = actPlayer;
                    logger.info(actPlayer, '犯规');
                }

                else {
                    if (act.goal == 1) {
                        // 如果是乌龙球，不要记录
                        this.player1.addGoal(actPlayer == act.goal? act.sid: 0);
                    }
                    if (act.goal == 2) {
                        this.player2.addGoal(actPlayer == act.goal? act.sid: 0);
                    }
                    this.roundGoalPlayer = act.goal;
                    this.isFirstShot = true; // 下一次开始是初始进球

                    this.lastActionFoul = 0;
                    logger.info(actPlayer, '没犯规');
                }
            }
            else {
                this.isFirstShot = false; // 经历了一次不进球的行动
                this.lastActionFoul = 0;
                this.onceAgainSid = act.onceAgainSid; // 下回合强制的行动者
                logger.info(actPlayer, '没犯规');
            }

            this.recentAction = act;
            // 广播通知

            this.room.emit('on1104_Fight_action', act);
        }catch(e){
            logger.error(e);
        }

        return {};
    },

    // 执行防守操作
    actionDefense: function(actPlayer, act){
        // 判断是否为当前回合行动者
        if (actPlayer != this.roundPlayer) {
            var msg = "you are not roundPlayer, you are " + actPlayer;
            return {code:app.code.Fight.NotRoundPlayer, msg: msg};
        }
        // 当前回合已经行动过
        if (this.roundActTime) {
            var msg = "already has action";
            return {code:app.code.Fight.NotRoundPlayer, msg: msg};
        }
        // 奇数回合可操作
        if (this.kickRound % 2 != 1){
            var msg = "jishu round can do defense";
            return {code:app.code.Fight.NotRoundPlayer, msg: msg};
        }
        // 方向错误
        if (act.direction != 1 && act.direction != 2){
            var msg = "actionDefense, fix direction:" + act.direction;
            act.direction = 0;
            logger.error(msg);
        }
        // 回合数错误
        if (this.kickRound != act.round){
            var msg = "actionDefense, fix round:" + act.round;
            act.round = this.kickRound;
        }


        this.roundActTime = new Date();
        this.roundActLastTime = 0; // 当前动作执行时间

        this.defenseDirection = act.direction;

        this.room.emit('on1112_Fight_kickDefense', {round:this.kickRound});
        return {act: act};
    },

    /**
     * 执行点球操作， 服务端根据方向判断是否扑到
     * @param actPlayer 1/2
     * @param act
     * @param endPos
     * @param details
     * @returns {boolean}
     */
    actionKick: function(actPlayer, kickAct){
        // 判断是否为当前回合行动者
        if (actPlayer != this.roundPlayer) {
            var msg = "you are not roundPlayer, you are " + actPlayer;
            return {code:app.code.Fight.NotRoundPlayer, msg: msg};
        }
        // 当前回合已经行动过
        if (this.roundActTime) {
            var msg = "already has action";
            return {code:app.code.Fight.NotRoundPlayer, msg: msg};
        }
        // 偶数回合可操作
        if (this.kickRound % 2 != 0){
            var msg = "oushu round can do defense";
            return {code:app.code.Fight.NotRoundPlayer, msg: msg};
        }

        // 取防守的进攻结果
        var act = kickAct.acts[this.defenseDirection];
        act.direction = this.defenseDirection;
        if (!act){
            var msg = "not commit direction:" + this.defenseDirection;
            return {code:app.code.Fight.Param_Invalid, msg: msg};
        }
        this.roundActLastTime = Math.max(0, act.endTime + 1); // +1秒恢复动作
        act.round = this.kickRound; // 回合数

        try {
            this.roundActTime = new Date();

            var goal = 0;
            // 发球者是得分者,则得1分
            if (act.goal == actPlayer) {
                goal = 1;
            }
            var player = this.getPlayer(this.roundPlayer);
            player.setKickGoal(this.kickRound, goal); // 记录得分

            if (this.isEndless()) {
                // 没碰到球,记录，结算时触发结束
                if (act.miss > 0){
                    this.miss = this.roundPlayer;
                    var player = this.getPlayer(this.roundPlayer);
                    player.setEndlessMiss(); // 标记没碰球
                }
            }

            // 广播通知
            this.room.emit('on1113_Fight_kickAction', act);
        }catch(e){
            logger.error(e);
        }

        return {};
    },

    // 尝试记录同步回合开始，  两方都可能发或者不发
    tryTempRoundStart: function(msg){
        var round = msg.round;
        if(round != this.round){
            logger.error('tryTempRoundStart round:%s != curRound:%s', round, this.round);
            return false;
        }
        if (this.roundStartTrigered) {
            logger.error('tryTempRoundStart round:%s already has roundTempScore', round);
            return false;
        }
        this.roundStartTrigered = true;
        this.roundStartInfo = msg;

        return true;
    },

    /**
     * 常规300s，切换到下一个回合
     */
    nextRound: function(){
        // 如果上回合没人行动
        if(this.round > 0 && !this.roundActTime) {
            logger.info('nextRound ,上回合没有行动');
            this.lastActionFoul = 0; // 没犯规
            this.isFirstShot = false; // 下次不是第一次
            this.onceAgainSid = 0;  // 清理上回合的强制行动球员
        }

        this.roundStartTrigered = false;
        this.round += 1;
        this.roundStartTime = new Date();
        this.roundActLastTime = 0;
        this.roundActTime = null;

        var forceRoundPlayer = 0;
        // 如果上回合犯规，这回合保持不变
        if (this.lastActionFoul > 0) {
            this.roundPlayer = this.lastActionFoul;
            logger.info('nextRound, 上回合有人犯规，对手保持不变，依然为', this.roundPlayer);
        }
        else if (this.roundGoalPlayer > 0) {
            // 强制设为上回合进球方
            this.roundPlayer = this.roundGoalPlayer;
            this.roundGoalPlayer = 0;
            logger.info('nextRound, 上回合进球者', this.roundPlayer);
        }else if (this.onceAgainSid > 0){
            // 都没有犯规或者得分，那么强制roundPlayer为对手
            forceRoundPlayer = Math.round(this.onceAgainSid / 10); // 1或2
            logger.info('nextRound, 强制下回合操作球员', this.onceAgainSid);
        }

        this.roundPlayer = this.roundPlayer == 1?2:1;
        if (forceRoundPlayer)
            this.roundPlayer = forceRoundPlayer;

        logger.info('nextRound, 切换对手为', this.roundPlayer);

        this.room.emit('on1103_Fight_round', {
            leftSec: this.getLeftSec(),
            round: this.round,
            roundLeftSec: RoundTime,
            roundPlayer: this.roundPlayer,
            onceAgainSid: this.onceAgainSid,
        });

        return this.round;
    },

    // 是否在无限点球阶段
    isEndless: function(){
        return this.kickRound > KickTimes * 2;
    },

    // 检测无尽阶段是否胜负
    checkEndless: function(){
        if (!this.isEndless())
            return false;

        // 一轮结束
        if (this.kickRound % 4 == 0){
            if (this.player1.getKickGoalCnt() != this.player2.getKickGoalCnt()) {
                // 已分胜负
                var winner = this.player1.getKickGoalCnt() > this.player2.getKickGoalCnt() ? 1:2;
                this.close(winner);
                return true;
            }
        }
        return false;
    },

    // 下一个点球回合
    nextKickRound: function(){

        // 点球大战结束，判断是否有分胜负
        if (this.kickRound == KickTimes * 2) {
            if (this.player1.getKickGoalCnt() != this.player2.getKickGoalCnt()) {
                logger.error("nextKickRound round:", this.kickRound, this.player1.getKickGoalCnt(), this.player2.getKickGoalCnt());
                // 已分胜负
                var winner = this.player1.getKickGoalCnt() > this.player2.getKickGoalCnt() ? 1:2;
                this.close(winner);
                return;
            }
            // 进入无限点球
            else {
                this.state = State.Endless;
                this.room.emit('on1120_Fight_startEndless', {});
            }
        }
        // 10球内， 每2轮一回合，结算一次
        else if (this.kickRound >= 6 * 2 && this.kickRound <= KickTimes * 2 && this.kickRound % 2 == 0){
            var diff = this.player1.getKickGoalCnt() - this.player2.getKickGoalCnt();
            var leftCount1 = (KickTimes / 2) - parseInt(this.kickRound / 4);
            var leftCount2 = (KickTimes / 2) - parseInt((this.kickRound + 2) / 4);
            //（1号玩家进球数 - 2号玩家进球数）> 2号玩家剩余个数 则1号玩家赢
            if(diff > 0 && diff > leftCount2){
                this.close(1);
                return;
            }
            //（2号玩家进球数 - 1号玩家进球数）> 1号玩家剩余个数 则1号玩家赢
            if(diff < 0 && Math.abs(diff) > leftCount1){
                this.close(2);
                return;
            }

           /* if (Math.abs(diff) >= 3) {
                var winner = diff > 0 ? 1 : 2;
                this.close(winner);
                return;
            }*/
        }

        var roundPlayer = {
                0:1, // 1号防守
                1:2, // 2号进攻
                2:2, // 2号防守
                3:1  // 1号进攻
            }
        // 初始第一轮
        var index = this.kickRound % 4;
        this.roundPlayer = roundPlayer[index];

        // 进入新一轮，默认防守方向中间
        if (this.kickRound % 2 == 0){
            this.defenseDirection = Direction.Middle;
        }

        this.kickRound += 1;
        this.roundStartTime = new Date();
        this.roundActLastTime = 0;
        this.roundActTime = null;

        this.room.emit('on1111_Fight_kickRound', {
            round: this.kickRound,
            roundLeftSec: KickRoundTime,
            roundPlayer: this.roundPlayer,
        });
    },

    getLeftSec: function(){
        var time = new Date();
        if (!this.startTime)
            return -1;
        var leftSec = Math.max(0, FightTime - (time.getTime() - this.startTime.getTime()) / 1000);
        return Math.round(leftSec);
    },

    // 不同阶段，回合时间不同
    getRoundLeftSec: function(){
        var time = new Date();
        if (!this.roundStartTime)
            return -1;
        var maxTime = RoundTime;
        if (this.state > State.Playing)
            maxTime = KickRoundTime;
        var leftSec = Math.max(0, maxTime - (time.getTime() - this.roundStartTime.getTime()) / 1000);
        return Math.round(leftSec);
    }
});


/**
 * 绑定模块外部方法
 */
module.exports = fight;
