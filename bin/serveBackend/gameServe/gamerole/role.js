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
const mx_tool_1 = require("mx-tool");
const defines_1 = require("../../../defines/defines");
const gamerole_1 = require("../../../defines/gamerole");
const interface_1 = require("../../../defines/interface");
const logger_1 = require("../../../lib/logger");
const TableMgr_1 = require("../../../lib/TableMgr");
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
    get playerItems() {
        return this.dbInfo.get('playerItems');
    }
    set playerItems(items) {
        this.dbInfo.set('playerItems', items);
    }
    // 发给客户端的数据
    toClient() {
        let loginInfo = {
            // 玩家姓名
            playerName: this.playerName,
            // 玩家密码
            pwd: this.pwd,
            // gameId
            gameId: this.gameId,
            // 是否是新手
            isNewPlayer: this.isNew,
            // 是否是创世神
            isCreatorGod: false,
            // 任务列表
            task: this.taskListArray,
            // 邮件列表
            mail: this.mailInfos,
            // 玩家道具
            items: this.playerItems || {},
            // 氤氲元魂
            breath: this.breath || 0,
            // 上次活跃的时间
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
    // 获取成就数据列表
    get achievementDataList() {
        // 初始化成就数据
        this.initAchievementData();
        // 包含各个成就状态信息的数组
        let retArray = [];
        let v = this.achievementInfos.value;
        for (let key in v) {
            retArray.push(v[key]);
        }
        return retArray;
    }
    // 初始化成就数据，完成返回真
    initAchievementData() {
        let updated = false;
        // 读取表中所有成就
        let allAchievementRes = TableMgr_1.TableMgr.inst.getAllAchievementRes();
        for (let key in allAchievementRes) {
            // 匹配成就
            let acRes = allAchievementRes[key];
            updated = this.checkAndUpdateAchievementData(acRes, 0);
        }
        return updated;
    }
    // 检查并更新成就数据，完成返回真
    checkAndUpdateAchievementData(acRes, updateVal) {
        let acId = acRes.sID;
        let roleAcDatas = this.achievementInfos.value;
        let needSaveDB = false;
        let curAcData = roleAcDatas[acId];
        // 新增成就数据
        if (!curAcData) {
            curAcData = { acId: acId, completeVaule: 0, awardStages: [] };
            needSaveDB = true;
        }
        if (!curAcData) {
            // 理论上不应该出现
            return needSaveDB;
        }
        let updated = false;
        // 更新已经完成的次数
        updated = this.updateAchievementCompleteValue(curAcData, acRes, updateVal);
        if (updated) {
            needSaveDB = true;
        }
        if (needSaveDB) {
            this.achievementInfos.set(acId.toString(), curAcData);
        }
        return needSaveDB;
    }
    // 更新成就完成次数，完成返回真
    updateAchievementCompleteValue(acData, acRes, updateVal) {
        let updated = false;
        if (updateVal <= 0) {
            return updated;
        }
        switch (acRes.eType) {
            case interface_1.SeEnumAchievementeType.IU_FenZhi:
                acData.completeVaule += updateVal;
                updated = true;
                break;
            case interface_1.SeEnumAchievementeType.IU_ZhuXian:
                acData.completeVaule += updateVal;
                updated = true;
                break;
        }
        return updated;
    }
    // 按成就类型触发更新成就信息
    TriggerCheckAchievementByType(achievementType, updateVal) {
        // 获取指定类型成就配置信息
        let acResList = TableMgr_1.TableMgr.inst.getAchievementResByType(achievementType);
        if (acResList.length <= 0) {
            return;
        }
        for (let i = 0; i < acResList.length; ++i) {
            let acRes = acResList[i];
            if (acRes.eType !== achievementType) {
                continue;
            }
            this.updateAchievement(acResList[i], updateVal);
        }
    }
    // 更新成就任务，完成返回真
    updateAchievement(acRes, updateVal) {
        let updated = this.checkAndUpdateAchievementData(acRes, updateVal);
        return updated;
    }
    // 加载/初始化成就列表
    loadAchievement() {
        return __awaiter(this, void 0, void 0, function* () {
            const v = yield mx_database_1.MongodbMoudle.get_database(defines_1.DBDefine.db).get_unit(defines_1.DBDefine.col_achievement, { _id: this.gameId }).load();
            this.achievementInfos = v;
        });
    }
    // 获取成就列表[返给客户端用的]
    getAchievementList() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.achievementInfos) {
                yield this.loadAchievement();
            }
            let retList = this.achievementDataList;
            return retList;
        });
    }
    // 领取成就奖励
    getAchievementAward(acId, stage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.achievementInfos) {
                yield this.loadAchievement();
            }
            // 获取成就配置信息
            let acRes = TableMgr_1.TableMgr.inst.getAchievementResById(acId);
            if (!acRes) {
                throw { code: defines_1.ErrorCode.achievement_table_res_fail, errMsg: 'achievement table res fail' };
            }
            // 检查是否存在对应的阶段
            let stageCondition = TableMgr_1.TableMgr.inst.getAchievementStageCondition(acRes, stage);
            if (stageCondition < 0) {
                throw { code: defines_1.ErrorCode.achievement_invalid_stage, errMsg: 'achievement invalid stage' };
            }
            // 获取当前成就数据
            let roleAcDatas = this.achievementInfos.value;
            let curAcData = roleAcDatas[acId];
            if (!curAcData) {
                throw { code: defines_1.ErrorCode.achievement_invalid_data, errMsg: 'achievement invalid data' };
            }
            // 检查是否已经领取对应的阶段奖励
            for (let i = 0; i < curAcData.awardStages.length; ++i) {
                let completeCondition = curAcData.awardStages[i];
                if (completeCondition === stageCondition) {
                    // 说明已经领取过奖励了
                    throw { code: defines_1.ErrorCode.achievement_repeat_award, errMsg: 'achievement repeat award' };
                }
            }
            // 检查玩家是否已经达到领取条件
            if (curAcData.completeVaule < stageCondition) {
                throw { code: defines_1.ErrorCode.achievement_not_complete, errMsg: 'achievement no complete' };
            }
            // 获取奖励物品列表
            let awardItems = TableMgr_1.TableMgr.inst.getAchievementAwardItems(acRes, stage);
            if (!awardItems || awardItems.length <= 0) {
                throw { code: defines_1.ErrorCode.achievement_table_res_fail, errMsg: 'achievement table res fail' };
            }
            // 更新成就数据
            curAcData.awardStages.push(stageCondition);
            this.achievementInfos.set(acId, curAcData);
            // 下放奖励物品
            for (let i = 0; i < awardItems.length; ++i) {
                let awardItemString = awardItems[i];
                let awardItem = awardItemString.split(',');
                if (awardItem.length !== 2) {
                    continue;
                }
                let awardItemId = awardItem[0];
                let awardItemCount = parseInt(awardItem[1]);
                this.updateItemCount(awardItemId, this.getItemCount(awardItemId) + awardItemCount);
            }
            // 返回结果
            return { code: defines_1.ErrorCode.ok };
        });
    }
    // 获取任务列表[返给客户端用的]
    getTaskList() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.taskInfos) {
                yield this.loadTask();
            }
            let retList = this.taskListArray;
            return (retList);
        });
    }
    // 加载/初始化任务列表
    loadTask() {
        return __awaiter(this, void 0, void 0, function* () {
            const v = yield mx_database_1.MongodbMoudle.get_database(defines_1.DBDefine.db).get_unit(defines_1.DBDefine.col_task, { _id: this.gameId }).load();
            this.taskInfos = v;
        });
    }
    get taskListArray() {
        // 初始化任务数据
        this.initTaskData();
        let retArray = [];
        let v = this.taskInfos.value;
        for (let key in v) {
            retArray.push(v[key]);
        }
        return retArray;
    }
    // 初始化任务数据
    initTaskData() {
        let taskData = this.taskInfos.value;
        let taskList = TableMgr_1.TableMgr.inst.getAllTaskRes();
        let nowTime = mx_tool_1.LocalDate.now();
        for (let key in taskList) {
            let taskConfig = taskList[key];
            let taskId = taskConfig.sID || '';
            let curTaskInfo = taskData[taskId];
            if (!curTaskInfo) {
                // 新增任务
                curTaskInfo = { taskId: taskId, value: 0, status: gamerole_1.TaskStatus.UnComplete, updateTime: nowTime, extra: {} };
                this.taskInfos.set(taskId.toString(), curTaskInfo);
            }
            else {
                let isDifDay = !this.isSameDay(curTaskInfo.updateTime, nowTime);
                // 重置每日任务
                if (isDifDay) {
                    curTaskInfo.value = 0;
                    curTaskInfo.status = gamerole_1.TaskStatus.UnComplete;
                    curTaskInfo.updateTime = nowTime;
                    curTaskInfo.extra = {};
                    this.taskInfos.set(taskId.toString(), curTaskInfo);
                }
            }
        }
    }
    // 获取任务奖励
    getTaskAward(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 先检查重置任务数据
            yield this.getTaskList();
            let taskConfig = TableMgr_1.TableMgr.inst.getTaskResById(taskId);
            if (!taskConfig) {
                throw { code: defines_1.ErrorCode.task_invalid_res, errMsg: 'task_invalid_res' };
            }
            let taskList = this.taskInfos.value;
            if (!taskList[taskId]) {
                throw { code: defines_1.ErrorCode.task_award_not_find_record, errMsg: "task_award_not_find_record" };
            }
            let taskInfo = taskList[taskId];
            // 任务已经被领取
            if (taskInfo.status === gamerole_1.TaskStatus.Rewarded) {
                throw { code: defines_1.ErrorCode.task_already_get_award, errMsg: "task_already_get_award" };
            }
            let nowTime = mx_tool_1.LocalDate.now();
            // 对某些类型的任务需要检查完成状态
            if (taskConfig.eTaskType === interface_1.SeEnumTaskeTaskType.DingShiDengLu) {
                let timeCond = taskConfig.sCondition.split("|");
                if (timeCond && timeCond.length === 2) {
                    let beginHour = parseInt(timeCond[0]);
                    let endHour = parseInt(timeCond[1]);
                    let nowHour = new Date(nowTime).getHours();
                    if (nowHour >= beginHour && nowHour <= endHour) {
                        taskInfo.status = gamerole_1.TaskStatus.CanReward;
                    }
                }
            }
            // 任务奖励还不能领取
            if (taskInfo.status === gamerole_1.TaskStatus.UnComplete) {
                throw { code: defines_1.ErrorCode.task_award_uncomplete, errMsg: "task_award_uncomplete," };
            }
            // 发放任务奖励
            let rewardItems = taskConfig.asTaskitems;
            for (let i = 0; rewardItems && i < rewardItems.length; ++i) {
                let rewardItem = rewardItems[i].split(',');
                if (rewardItem && rewardItem.length == 2) {
                    this.updateItemCount(rewardItem[0], this.getItemCount(rewardItem[0]) + parseInt(rewardItem[1]));
                }
            }
            // 更新任务数据
            taskInfo.updateTime = nowTime;
            taskInfo.status = gamerole_1.TaskStatus.Rewarded;
            // 保存任务数据
            this.taskInfos.set(taskInfo.taskId, taskInfo);
            return { awardItems: rewardItems };
        });
    }
    // 更新任务
    static updateTask(gameId, actionType, extra = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let role = UnitRole.gameIdMap.get(gameId);
            if (!role)
                throw ({ code: defines_1.ErrorCode.role_no, errMsg: 'no role :' + gameId });
            // 检查任务配置是否有此任务
            let taskList = TableMgr_1.TableMgr.inst.getTaskInfoByType(actionType);
            if (taskList.length <= 0) {
                console.log(`no taskId:${interface_1.SeEnumTaskeTaskType[actionType]}`);
                // throw({ code: ErrorCode.role_no_taskType, errMsg: 'no taskId:' + SeEnumTaskeTaskType[actionType] });
            }
            let isUpdate = false;
            for (let i = 0; i < taskList.length; ++i) {
                let updated = this._updateTask(actionType, role, taskList[i], extra);
                if (updated) {
                    isUpdate = true;
                }
            }
            if (isUpdate) {
                // 保存数据
                try {
                    yield role.taskInfos.force_save();
                    return { code: defines_1.ErrorCode.ok, update: isUpdate };
                }
                catch (e) {
                    throw ({ code: defines_1.ErrorCode.db_error, errMsg: e });
                }
            }
            else {
                return { code: defines_1.ErrorCode.ok, update: isUpdate };
            }
        });
    }
    static _updateTask(taskType, role, taskConfig, extra) {
        let taskId = taskConfig.sID || '';
        if (taskType === interface_1.SeEnumTaskeTaskType.DingShiDengLu) {
            return false;
        }
        let nowTime = mx_tool_1.LocalDate.now();
        // 没有记录就创建一条新任务数据
        let curTaskInfo = role.taskInfos.get(taskId.toString());
        if (!curTaskInfo) {
            curTaskInfo = { taskId: taskId, value: 0, status: gamerole_1.TaskStatus.UnComplete, updateTime: nowTime, extra: {} };
        }
        if (curTaskInfo.status != gamerole_1.TaskStatus.UnComplete) {
            return false;
        }
        // 如果是邀请好友任务，则需要记录角色数据
        if (taskType === interface_1.SeEnumTaskeTaskType.YaoQingHaoYou) {
            // 说明已经邀请过了
            if (curTaskInfo.extra.hasOwnProperty(extra.senderId)) {
                return false;
            }
            // 保存好友信息
            curTaskInfo.extra[extra.senderId] = extra.senderAvatar;
        }
        curTaskInfo.value++;
        if (curTaskInfo.value >= parseInt(taskConfig.sCondition)) {
            curTaskInfo.status = gamerole_1.TaskStatus.CanReward;
        }
        role.taskInfos.set(taskId.toString(), curTaskInfo);
        return true;
    }
    // 判断是否同一天
    isSameDay(timeStampA, timeStampB) {
        let dateA = new Date(timeStampA);
        let dateB = new Date(timeStampB);
        return (dateA.setHours(0, 0, 0, 0) == dateB.setHours(0, 0, 0, 0));
    }
}
exports.UnitRole = UnitRole;
UnitRole.gameIdMap = new Map();
//# sourceMappingURL=role.js.map