import { createHash } from "crypto";
import { LocalDate } from "mx-tool";
import { ErrorCode } from "../../../defines/defines";
import { UnitRole } from "./role";

export class GameRoleService {

    static init() {
        return UnitRole.init();
    }

    // 登录
    static async login(gameId: string, playerName: string, pwd: string) {
        try {
            let role = await UnitRole.getRole(gameId)

            // 验证密码
            if (role.role.pwd === pwd) {
                return GameRoleService._loadSucc(gameId, role.role)
            }

            return { code: ErrorCode.pwd_is_wrong, errMsg: '密码有误！' }

        }
        catch (e) {
            if (e.code == ErrorCode.role_no) {
                let data = await UnitRole.registRole(gameId, playerName, pwd)
                return GameRoleService._loadSucc(gameId, data.role)
            } else {
                // 失败的时候
                throw ({ code: ErrorCode.login_error, errMsg: e.errMsg || e.message || "" });
            }
        }
    }

    // 玩家登录成功后的消息推送
    private static async _loadSucc(gameId: string, role: UnitRole) {
        // 提取出用信息推送
        // 需要设置用户一个token 后续通过token来判断登录状态
        let token = createHash("md5").update('' + Date.now() + gameId + 'illusory_universe').digest("hex")
        role.dbInfo.set('token', token)
        try {
            await role.dbInfo.force_save()
        }
        catch (e) {
            console.error('_loadSucc', e)
            throw { code: ErrorCode.db_error, errMsg: '连接数据库失败' }
        }

        // 登录前的流程处理
        await role.beforeLogin()

        let roleInfo = role.toClient()

        // 登录后流程处理
        this.afterLogin(role)


        return { code: ErrorCode.ok, role: roleInfo, token: token, localTime: LocalDate.now() }
    }

    // 登录后操作
    private static afterLogin(role: UnitRole): void {
        // 清空奖励领取信息
        // role.clearSigninAwardInfo()

        // 更新玩家登录时间
        role.lastActivityTime = LocalDate.now()

        // 新号标记
        let isNew: boolean = role.isNew
        if (isNew) {
            role.isNew = false
        }
    }

    // 删除玩家信息
    static removeRole(gameId: string) {
        UnitRole.del(gameId)
    }

    // 执行管理命令
    static async gmCommand(gameId: string, token: string, cmd: string) {
        // 获取角色
        let ret = await UnitRole.getRole(gameId, token)
        if (!ret) {
            return Promise.reject({ code: ErrorCode.role_no, errMsg: "未找到该角色!" });
        }

        // 拆分指令码
        // ' addItem | breath | 10 '
        let cmdArr: Array<string> = cmd.split('|')
        if (cmdArr.length < 2) {
            return Promise.reject({ code: ErrorCode.gm_tool_execute_error, errMsg: "指令格式不对!" })
        }

        let role: UnitRole = ret.role;
        let optName: string = cmdArr[0]
        let tarName: string = cmdArr[1]
        let tarCount: number = parseInt(cmdArr[2]) || 0
        switch (optName) {
            // 增加物品
            case 'addItem': {
                // 判断有无此物品

                // 更新物品数量
                role.updateItemCount(tarName, role.getItemCount(tarName) + tarCount)
                break
            }

            default:
                return Promise.reject({ code: ErrorCode.gm_tool_execute_error, errMsg: "指令异常！" })
        }
        return Promise.resolve({ code: ErrorCode.ok, itemName: tarName, itemCount: role.getItemCount(tarName) })
    }

    // 获取玩家信息
    static loadPlayerInfo(gameId: string, token: string): Promise<{ code: number, role: any, lastSaveTime: number }> {
        return new Promise(function (resolve, reject) {
            UnitRole.getRole(gameId, token || '')
                .then(function ({ role }) {
                    resolve({ code: ErrorCode.ok, role: role.toClient(), lastSaveTime: role.lastActivityTime })
                }).catch(reject)
        })
    }


}