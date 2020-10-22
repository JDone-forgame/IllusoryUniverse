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
exports.AchievementService = void 0;
const defines_1 = require("../../../defines/defines");
const role_1 = require("../gamerole/role");
class AchievementService {
    static init() {
        return Promise.resolve();
    }
    // 获取成就列表
    static getAchievementList(gameId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let roleResult = yield role_1.UnitRole.getRole(gameId, token);
            if (!roleResult || !roleResult.role) {
                return Promise.reject({ code: defines_1.ErrorCode.role_no, errMsg: "role is not found!" });
            }
            let retList = yield roleResult.role.getAchievementList();
            return { code: defines_1.ErrorCode.ok, achieveList: retList };
        });
    }
    // 领取成就奖励
    static getAchievementAward(gameId, token, acId, stage) {
        return __awaiter(this, void 0, void 0, function* () {
            let roleResult = yield role_1.UnitRole.getRole(gameId, token);
            if (!roleResult) {
                return Promise.reject({ code: defines_1.ErrorCode.role_no, errMsg: "role is not found!" });
            }
            let role = roleResult.role;
            let result = yield role.getAchievementAward(acId, stage);
            let acDataList = yield role.getAchievementList();
            return { code: defines_1.ErrorCode.ok, acId: acId, stage: stage, acList: acDataList, allItems: role.playerItems };
        });
    }
}
exports.AchievementService = AchievementService;
//# sourceMappingURL=index.js.map