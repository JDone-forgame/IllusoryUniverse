"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoleService = void 0;
const crypto_1 = require("crypto");
const mx_tool_1 = require("mx-tool");
const defines_1 = require("../../../defines/defines");
const role_1 = require("./role");
class GameRoleService {
    static init() {
        return role_1.UnitRole.init();
    }
    // 登录
    static login(gameId, playerName, pwd) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let role = yield role_1.UnitRole.getRole(gameId);
                // 验证密码
                if (role.role.pwd === pwd) {
                    return GameRoleService._loadSucc(gameId, role.role);
                }
                return { code: defines_1.ErrorCode.pwd_is_wrong, errMsg: '密码有误！' };
            }
            catch (e) {
                if (e.code == defines_1.ErrorCode.role_no) {
                    let data = yield role_1.UnitRole.registRole(gameId, playerName, pwd);
                    return GameRoleService._loadSucc(gameId, data.role);
                }
                else {
                    // 失败的时候
                    throw ({ code: defines_1.ErrorCode.login_error, errMsg: e.errMsg || e.message || "" });
                }
            }
        });
    }
    // 玩家登录成功后的消息推送
    static _loadSucc(gameId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            // 提取出用信息推送
            // 需要设置用户一个token 后续通过token来判断登录状态
            let token = crypto_1.createHash("md5").update('' + Date.now() + gameId + 'illusory_universe').digest("hex");
            role.dbInfo.set('token', token);
            try {
                yield role.dbInfo.force_save();
            }
            catch (e) {
                console.error('_loadSucc', e);
                throw { code: defines_1.ErrorCode.db_error, errMsg: "db is error" };
            }
            // 登录前的流程处理
            yield role.beforeLogin();
            let roleInfo = role.toClient();
            // 登录后流程处理
            this.afterLogin(role);
            return { code: defines_1.ErrorCode.ok, role: roleInfo, token: token, localTime: mx_tool_1.LocalDate.now() };
        });
    }
    static afterLogin(role) {
        // 清空奖励领取信息
        // role.clearSigninAwardInfo();
        // 更新玩家登录时间
        role.lastActivityTime = mx_tool_1.LocalDate.now();
        // 新号标记
        let isNew = role.isNew;
        if (isNew) {
            role.isNew = false;
        }
    }
    // 删除角色
    static removeRole(gameId) {
        role_1.UnitRole.del(gameId);
    }
}
exports.GameRoleService = GameRoleService;
//# sourceMappingURL=index.js.map