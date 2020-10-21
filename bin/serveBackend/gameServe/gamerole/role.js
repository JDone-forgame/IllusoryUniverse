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
exports.UnitRole = void 0;
const mx_database_1 = require("mx-database");
const defines_1 = require("../../../defines/defines");
const logger_1 = require("../../../lib/logger");
const gameRPC_1 = require("../../../rpcs/gameRPC");
class UnitRole {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    get(key) {
        return this.dbInfo.get(key);
    }
    set(key, value) {
        this.dbInfo.set(key, value);
    }
    static get(gameId) {
        return this.gameIdMap.get(gameId);
    }
    get playerName() {
        return this.dbInfo.get('playerName') || '';
    }
    set playerName(v) {
        this.dbInfo.set('playerName', v);
    }
    get pwd() {
        return this.dbInfo.get('pwd') || '';
    }
    get gameId() {
        return this.dbInfo.get('gameId') || '';
    }
    set gameId(v) {
        this.dbInfo.set('gameId', v);
    }
    get breath() {
        return this.dbInfo.get('breath') || 0;
    }
    set breath(v) {
        this.dbInfo.set('breath', v);
    }
    get isNew() {
        return this.dbInfo.get('isNew');
    }
    set isNew(val) {
        this.dbInfo.set('isNew', val);
    }
    get isCreatorGod() {
        return this.dbInfo.get('isCreatorGod');
    }
    set isCreatorGod(val) {
        this.dbInfo.set('isCreatorGod', val);
    }
    get lastActivityTime() {
        return this.dbInfo.get('lastActivityTime');
    }
    get token() {
        return this.dbInfo.get('token');
    }
    set lastActivityTime(v) {
        this.dbInfo.set('lastActivityTime', v);
    }
    get taskListArray() {
        // 初始化任务数据
        // this.initTaskData();
        let retArray = [];
        let v = this.taskInfos.value;
        for (let key in v) {
            retArray.push(v[key]);
        }
        return retArray;
    }
    get playerItems() {
        return this.dbInfo.get('playerItems');
    }
    set playerItems(items) {
        this.dbInfo.set('playerItems', items);
    }
    // 发给客户端的数据
    toClient() {
        let loginInfo = {
            playerName: this.playerName,
            pwd: this.pwd,
            gameId: this.gameId,
            isNewPlayer: this.isNew,
            isCreatorGod: false,
            task: this.taskListArray,
            mail: this.mailInfos,
            items: this.playerItems || {},
            breath: this.breath || 0,
            lastActivityTime: this.lastActivityTime,
        };
        return loginInfo;
    }
    // 获取玩家
    static getRole(gameId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gameIdMap.has(gameId)) {
                if (token == undefined || this.gameIdMap.get(gameId).token == token) {
                    return { code: defines_1.ErrorCode.ok, role: this.gameIdMap.get(gameId) };
                }
                else {
                    throw ({ code: defines_1.ErrorCode.role_token_error, errMsg: 'token 错误' });
                }
            }
            // 重新下载玩家
            return new Promise(function (resolve, reject) {
                mx_database_1.MongodbMoudle.get_database(defines_1.DBDefine.db).get_unit(defines_1.DBDefine.col_role, { _id: gameId }).load().then(function (dbInfo) {
                    if (dbInfo.empty) {
                        // 这里需要创角
                        reject({ code: defines_1.ErrorCode.role_no });
                    }
                    else {
                        // 这里ok了
                        UnitRole.createLoad(gameId, dbInfo).then(role => {
                            if (token == undefined || role.token == token) {
                                resolve({ code: defines_1.ErrorCode.ok, role: UnitRole.get(gameId) });
                            }
                            else {
                                reject({ code: defines_1.ErrorCode.role_token_error, errMsg: 'token 错误' });
                            }
                        }).catch(function () {
                            reject({ code: defines_1.ErrorCode.role_token_error, errMsg: 'token 错误' });
                        });
                    }
                }).catch(function (res) {
                    // 异常了，这里需要推出
                    // console.log(res);
                    reject({ code: defines_1.ErrorCode.db_error, errMsg: res });
                });
            });
        });
    }
    // 创建一个对象
    static createLoad(gameId, db) {
        return __awaiter(this, void 0, void 0, function* () {
            if (UnitRole.gameIdMap.has(gameId))
                return UnitRole.gameIdMap.get(gameId);
            let role = new UnitRole();
            role.dbInfo = db;
            role.gameId = gameId;
            // 读取邮件
            yield role.loadMail();
            // 读取任务
            yield role.loadTask();
            UnitRole.gameIdMap.set(gameId, role);
            // 通知一下其他人
            gameRPC_1.gameRPC.inst.bcRemoveRole(gameId);
            return role;
        });
    }
    // 加载邮件
    loadMail() {
        return __awaiter(this, void 0, void 0, function* () {
            const v = yield mx_database_1.MongodbMoudle.get_database(defines_1.DBDefine.db).get_list(defines_1.DBDefine.col_mail, { ownerId: this.gameId }).load();
            this.mailInfos = v.value;
            for (let i = 0; i < this.mailInfos.length; i++) {
                let rMail = this.mailInfos[i];
            }
        });
    }
    // 加载任务
    loadTask() {
        return __awaiter(this, void 0, void 0, function* () {
            const v = yield mx_database_1.MongodbMoudle.get_database(defines_1.DBDefine.db).get_unit(defines_1.DBDefine.col_task, { _id: this.gameId }).load();
            this.taskInfos = v;
        });
    }
    // 登录前操作
    beforeLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            // 重置每日数据
            // await this.resetDailyData();
            // 自动领取每日签到奖励
            // this.getSigninAward();
            // 应用系统邮件
            // await this.applySystemMail();
            // 保存登录日志
            // LoggerMoudle.roleLogin(this.gameId, this.uid, this.activityId, inviterId);
        });
    }
    // 注册流程
    static registRole(gameId, playerName, pwd) {
        // 检查缓存池中是否有该玩家
        if (this.gameIdMap.has(gameId))
            throw ({ code: defines_1.ErrorCode.role_exist });
        return new Promise(function (resolve, reject) {
            mx_database_1.MongodbMoudle.get_database(defines_1.DBDefine.db)
                .update_insert(defines_1.DBDefine.col_role, { _id: gameId }, {
                playerName: playerName,
                pwd: pwd,
                gameId: gameId,
            })
                .then(function () {
                UnitRole.getRole(gameId).then((rs) => {
                    // 初始化角色数据
                    UnitRole.initRoleData(gameId);
                    // 保存注册日志
                    logger_1.LoggerMoudle.roleRegist(gameId, playerName, pwd);
                    resolve(rs);
                }).catch(reject);
            }).catch(reject);
        });
    }
    // 初始化玩家数据
    static initRoleData(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            let role = this.gameIdMap.get(gameId);
            if (role) {
                // 新手标记
                role.isNew = true;
                role.isCreatorGod = false;
            }
        });
    }
    // 删除角色
    static del(gameId) {
        let t_info = this.gameIdMap.get(gameId);
        if (!t_info)
            return false;
        this.gameIdMap.delete(t_info.gameId);
        return true;
    }
    // 更新道具数量
    updateItemCount(itemId, newCount) {
        let items = this.dbInfo.get('playerItems') || {};
        items[itemId] = newCount;
        this.dbInfo.set('playerItems', items);
        // 如果是平台物品则直接通知平台
        // PlatformNet.sendItem(this.gameId, itemId, newCount, this.uid, this.activityId);    
        return { code: defines_1.ErrorCode.ok };
    }
    // 获取道具数量
    getItemCount(itemId) {
        // let items = this.dbInfo.get('playerItems') || {};
        // 如果道具是体力，刷新下体力值
        // if (itemId == UnitRole.STRENGTH_ITEM_ID) {
        //     this.updateStrength(items[itemId] || 0);
        // }
        let newItems = this.dbInfo.get('playerItems') || {};
        return newItems[itemId] || 0;
    }
}
exports.UnitRole = UnitRole;
UnitRole.gameIdMap = new Map();
//# sourceMappingURL=role.js.map