import { RPCHandle } from "mx-rpc";
import { ErrorCode } from "../../defines/defines";
import { AchievementService } from "./achievement";
import { GameRoleService } from "./gamerole"
import { TaskService } from "./task";

@RPCHandle.class('game', module)
class game {

    @RPCHandle.init()
    public init(): boolean {

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
    @RPCHandle.route()
    login(gameId: string, playerName: string, pwd: string) {
        return GameRoleService.login(gameId, playerName, pwd)
    }

    /**
     * 从内存中移除角色数据
     * @route broadcast bcRemoveRole
     * @group game - 活动管理器
     * @key gameId
     * @param {string} gameId.query.required - 玩家id
     * @returns {{code: ErrorCode}} 0 - 返回信息
     */
    @RPCHandle.route()
    bcRemoveRole(gameId: string) {
        GameRoleService.removeRole(gameId);
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
    @RPCHandle.route()
    gmCommand(gameId: string, token: string, cmd: string) {
        return GameRoleService.gmCommand(gameId, token, cmd)
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
    @RPCHandle.route()
    loadPlayerInfo(gameId: string, token: string) {
        return GameRoleService.loadPlayerInfo(gameId, token)
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
    @RPCHandle.route()
    getAchievementList(gameId: string, token: string): Promise<{ code: ErrorCode }> {
        return AchievementService.getAchievementList(gameId, token);
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
    @RPCHandle.route()
    getTaskList(gameId: string, token: string) {
        return TaskService.getTaskList(gameId, token);
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
    @RPCHandle.route()
    getTaskAward(gameId: string, token: string, taskId: string) {
        return TaskService.getTaskAward(gameId, token, taskId);
    }

}
