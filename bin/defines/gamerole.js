"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eMailType = exports.eMailFunctionType = exports.TaskStatus = void 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus[TaskStatus["UnComplete"] = 1] = "UnComplete";
    TaskStatus[TaskStatus["CanReward"] = 2] = "CanReward";
    TaskStatus[TaskStatus["Rewarded"] = 3] = "Rewarded";
})(TaskStatus = exports.TaskStatus || (exports.TaskStatus = {}));
var eMailFunctionType;
(function (eMailFunctionType) {
    /** 好友分享奖励 */
    eMailFunctionType[eMailFunctionType["FriendShareReward"] = 0] = "FriendShareReward";
})(eMailFunctionType = exports.eMailFunctionType || (exports.eMailFunctionType = {}));
var eMailType;
(function (eMailType) {
    /** 系统邮件 */
    eMailType[eMailType["System"] = 0] = "System";
    /** 用户邮件 */
    eMailType[eMailType["User"] = 1] = "User";
    /**道具邮件 */
    eMailType[eMailType["Proto"] = 2] = "Proto";
})(eMailType = exports.eMailType || (exports.eMailType = {}));
//# sourceMappingURL=gamerole.js.map