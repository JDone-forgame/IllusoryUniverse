import { createHash } from "crypto";
import { ConfigMgr } from "mx-tool";
import { WebRouteModule } from "mx-webserve";
import { ErrorCode } from "../../../../defines/defines";
import { gameRPC } from "../../../../rpcs/gameRPC"

@WebRouteModule.class(module)
class _ {
    /**
     * 登录接口
     * @date 2020-10-10
     * @group login - 登录相关
     * @route POST /game/local/login
     * @param {string} name.query.required - 游戏名称
     * @param {string} pwd.query.required - 登录密码
     * @returns {{code:number}} 0 - 返回内容
     */
    @WebRouteModule.route()
    @WebRouteModule.paramRequired("name", "string", true)
    @WebRouteModule.paramRequired("pwd", "string", true)
    async login(param: { [key: string]: any }) {
        let data = {
            code: 0,
            gameId: createHash('md5').update(param.name).digest('hex'),
            playerName: param.name,
            pwd: param.pwd
        }

        return gameRPC.inst
            .login(data.gameId, data.playerName, data.pwd);
    }

    /**
     * 执行gm指令
     * @date 2020-10-10
     * @route POST /game/local/gmCommand
     * @group game - 活动管理器
     * @param {string} gameId.query.required - 玩家id
     * @param {string} token.query.required - token
     * @param {string} cmd.query.required - cmd
     * @returns {{ code: number}} 0 - 操作结果
     */
    @WebRouteModule.paramRequired("gameId", "string", true)
    @WebRouteModule.paramRequired("token", "string", true)
    @WebRouteModule.paramRequired("cmd", "string", true)
    @WebRouteModule.route()
    gmCommand(param: { [key: string]: string }) {
        if (ConfigMgr.get("gm", false)) {
            return gameRPC.inst.gmCommand(param.gameId, param.token, param.cmd);
        } else {
            throw ({ code: ErrorCode.param_error, errMsg: `GM指令仅仅支持在开发中使用!` });
        }
    }

    /**
     * 读取玩家信息
     * @date 2020-10-10
     * @route POST /game/local/loadPlayerInfo
     * @group game - 活动管理器
     * @param {string} gameId.query.required - 玩家id
     * @param {string} token.query.required - token
     * @param {string} cmd.query.required - cmd
     * @returns {{ code: number}} 0 - 操作结果
     */
    @WebRouteModule.paramRequired("gameId", "string", true)
    @WebRouteModule.paramRequired("token", "string", true)
    @WebRouteModule.route()
    loadPlayerInfo(param: { [key: string]: string }) {
        return gameRPC.inst.loadPlayerInfo(param.gameId, param.token);
    }


}