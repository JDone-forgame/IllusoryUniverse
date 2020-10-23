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
exports.TaskService = void 0;
const defines_1 = require("../../../defines/defines");
const role_1 = require("../gamerole/role");
class TaskService {
    static init() {
        return Promise.resolve();
    }
    /**
     * 获取任务列表
     * @param gameId
     * @param token
     */
    static getTaskList(gameId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield role_1.UnitRole.getRole(gameId, token);
            if (!ret || !ret.role) {
                return Promise.reject({ code: defines_1.ErrorCode.role_no, errMsg: "role is not found!" });
            }
            let taskList = yield ret.role.getTaskList();
            return { code: defines_1.ErrorCode.ok, taskList: taskList };
        });
    }
    /**
     * 领取任务奖励
     * @param gameId
     * @param token
     * @param taskId
     */
    static getTaskAward(gameId, token, taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield role_1.UnitRole.getRole(gameId, token);
            if (!ret) {
                return Promise.reject({ code: defines_1.ErrorCode.role_no, errMsg: "role is not found!" });
            }
            let role = ret.role;
            // 领取奖励
            let result = yield role.getTaskAward(taskId);
            // 获取任务列表
            let newTaskList = yield role.getTaskList();
            // 返回结果
            return { code: defines_1.ErrorCode.ok, newTaskList: newTaskList, items: role.playerItems, awardItems: result.awardItems };
        });
    }
}
exports.TaskService = TaskService;
//# sourceMappingURL=index.js.map