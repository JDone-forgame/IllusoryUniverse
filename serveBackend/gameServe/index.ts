import { RPCHandle } from "mx-rpc";
import { GameRoleService } from "./gamerole"

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

}
