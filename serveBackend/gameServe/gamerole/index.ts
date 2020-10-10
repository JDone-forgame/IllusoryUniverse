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
            await role.dbInfo.force_save();
        }
        catch (e) {
            console.error('_loadSucc', e)
            throw { code: ErrorCode.db_error, errMsg: "db is error" }
        }

        // 登录前的流程处理
        await role.beforeLogin();

        let roleInfo = role.toClient();

        // 登录后流程处理
        this.afterLogin(role);


        return { code: ErrorCode.ok, role: roleInfo, token: token, localTime: LocalDate.now() };
    }

    private static afterLogin(role: UnitRole): void {
        // 清空奖励领取信息
        // role.clearSigninAwardInfo();

        // 更新玩家登录时间
        role.lastActivityTime = LocalDate.now();

        // 新号标记
        let isNew: boolean = role.isNew;
        if (isNew) {
            role.isNew = false;
        }
    }

    // 删除角色
    static removeRole(gameId: string) {
        UnitRole.del(gameId);
    }

}