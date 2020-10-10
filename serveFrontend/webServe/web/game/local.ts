import { createHash } from "crypto";
import { WebRouteModule } from "mx-webserve";
import { gameRPC } from "../../../../rpcs/gameRPC"

@WebRouteModule.class(module)
class _ {
    /**
     * 登录接口
     * @date 2020-10-10
     * @group login - 登录相关
     * @route POST /game/local/login
     * @param {string} name.query.required - 昵称
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

    
}