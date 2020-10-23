"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mx_rpc_1 = require("mx-rpc");
const achievement_1 = require("./achievement");
const gamerole_1 = require("./gamerole");
const task_1 = require("./task");
let game = class game {
    init() {
        return true;
    }
    /**
     * 登陆游戏
     * @route request login
     * @group game - 活动管理器
     * @key gameId
     * @param {string} gameId.query.required - 玩家id
     * @param {string} playerName.query.required - 玩家昵称
     * @param {string} pwd.query.required - 玩家密码
     * @returns {{code: ErrorCode}} 0 - 返回信息
     */
    login(gameId, playerName, pwd) {
        return gamerole_1.GameRoleService.login(gameId, playerName, pwd);
    }
    /**
     * 从内存中移除角色数据
     * @route broadcast bcRemoveRole
     * @group game - 活动管理器
     * @key gameId
     * @param {string} gameId.query.required - 玩家id
     * @returns {{code: ErrorCode}} 0 - 返回信息
     */
    bcRemoveRole(gameId) {
        gamerole_1.GameRoleService.removeRole(gameId);
    }
    /**
     * gm指令
     * @route request gmCommand
     * @group game - 活动管理器
     * @key gameId
     * @param {string} gameId.query.required - 玩家id
     * @param {string} token.query.required - token
     * @param {string} cmd.query.required - 参数
     * @returns {{ code: number}} 0 - 登陆信息
     */
    gmCommand(gameId, token, cmd) {
        return gamerole_1.GameRoleService.gmCommand(gameId, token, cmd);
    }
    /**
     * 读取玩家信息
     * @route request loadPlayerInfo
     * @group game - 活动管理器
     * @key gameId
     * @param {string} gameId.query.required - 玩家id
     * @param {string} token.query.required - token
     * @returns {{ code: number}} 0 - 登陆信息
     */
    loadPlayerInfo(gameId, token) {
        return gamerole_1.GameRoleService.loadPlayerInfo(gameId, token);
    }
    /**
    * 获取成就数据列表
    * @route request getAchievementList
    * @group game - 活动管理器
    * @key gameId
    * @param {string} gameId.query.required - 玩家id
    * @param {string} token.query.required - token
    * @returns {{code: ErrorCode}} 0 - 返回结果
    */
    getAchievementList(gameId, token) {
        return achievement_1.AchievementService.getAchievementList(gameId, token);
    }
    /**
    * 获取任务列表
    * @route request getTaskList
    * @group game - 活动管理器
    * @key gameId
    * @param {string} gameId.query.required - 玩家id
    * @param {string} token.query.required - token
    * @returns {{code: ErrorCode}} 0 - 返回信息
    */
    getTaskList(gameId, token) {
        return task_1.TaskService.getTaskList(gameId, token);
    }
    /**
     * 获取任务奖励
     * @route request getTaskAward
     * @group game - 活动管理器
     * @key gameId
     * @param {string} gameId.query.required - 玩家id
     * @param {string} token.query.required - token
     * @param {string} taskId.query.required - taskId
     * @returns {{code: ErrorCode}} 0 - 返回信息
     */
    getTaskAward(gameId, token, taskId) {
        return task_1.TaskService.getTaskAward(gameId, token, taskId);
    }
};
__decorate([
    mx_rpc_1.RPCHandle.init()
], game.prototype, "init", null);
__decorate([
    mx_rpc_1.RPCHandle.route()
], game.prototype, "login", null);
__decorate([
    mx_rpc_1.RPCHandle.route()
], game.prototype, "bcRemoveRole", null);
__decorate([
    mx_rpc_1.RPCHandle.route()
], game.prototype, "gmCommand", null);
__decorate([
    mx_rpc_1.RPCHandle.route()
], game.prototype, "loadPlayerInfo", null);
__decorate([
    mx_rpc_1.RPCHandle.route()
], game.prototype, "getAchievementList", null);
__decorate([
    mx_rpc_1.RPCHandle.route()
], game.prototype, "getTaskList", null);
__decorate([
    mx_rpc_1.RPCHandle.route()
], game.prototype, "getTaskAward", null);
game = __decorate([
    mx_rpc_1.RPCHandle.class('game', module)
], game);
//# sourceMappingURL=index.js.map