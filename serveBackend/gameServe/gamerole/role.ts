import { MongodbMoudle, ReHash } from "mx-database";
import { DBDefine, ErrorCode } from "../../../defines/defines";
import { ifAchievementInfo, ifMailInfo, ifTaskInfo, ifUnitRole } from "../../../defines/gamerole";
import { SeEnumAchievementeType, SeResAchievement } from "../../../defines/interface";
import { LoggerMoudle } from "../../../lib/logger";
import { TableMgr } from "../../../lib/TableMgr";
import { gameRPC } from "../../../rpcs/gameRPC";

export class UnitRole {
    static async init() {
        return;
    }

    private static gameIdMap: Map<string, UnitRole> = new Map();

    dbInfo!: ReHash<{ [key: string]: (string | number | object) }>;
    achievementInfos !: ReHash<{ [acId: string]: ifAchievementInfo }>;
    taskInfos !: ReHash<{ [taskId: string]: ifTaskInfo }>;
    mailInfos!: ifMailInfo[];

    get(key: string) {
        return this.dbInfo.get(key);
    }

    set(key: string, value: any) {
        this.dbInfo.set(key, value);
    }

    private static get(gameId: string): UnitRole {
        return this.gameIdMap.get(gameId) as UnitRole;
    }

    get playerName(): string {
        return this.dbInfo.get('playerName') || '';
    }

    set playerName(v: string) {
        this.dbInfo.set('playerName', v);
    }

    get pwd(): string {
        return this.dbInfo.get('pwd') || '';
    }

    get gameId(): string {
        return this.dbInfo.get('gameId') || '';
    }

    set gameId(v: string) {
        this.dbInfo.set('gameId', v);
    }

    get breath(): number {
        return this.dbInfo.get('breath') || 0;
    }

    set breath(v: number) {
        this.dbInfo.set('breath', v);
    }

    get isNew(): boolean {
        return this.dbInfo.get('isNew');
    }

    set isNew(val: boolean) {
        this.dbInfo.set('isNew', val);
    }

    get isCreatorGod(): boolean {
        return this.dbInfo.get('isCreatorGod');
    }

    set isCreatorGod(val: boolean) {
        this.dbInfo.set('isCreatorGod', val);
    }

    get lastActivityTime(): number {
        return this.dbInfo.get('lastActivityTime');
    }

    get token(): string {
        return this.dbInfo.get('token');
    }

    set lastActivityTime(v: number) {
        this.dbInfo.set('lastActivityTime', v);
    }

    get taskListArray(): ifTaskInfo[] {

        // 初始化任务数据
        // this.initTaskData();

        let retArray: ifTaskInfo[] = [];
        let v = this.taskInfos.value;
        for (let key in v) {
            retArray.push(v[key]);
        }
        return retArray;
    }

    get playerItems(): { [itemId: string]: number } {
        return this.dbInfo.get('playerItems');
    }

    set playerItems(items: { [itemId: string]: number }) {
        this.dbInfo.set('playerItems', items);
    }

    // 发给客户端的数据
    toClient() {

        let loginInfo: ifUnitRole = {
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
        }

        return loginInfo;
    }

    // 获取玩家
    static async getRole(gameId: string, token?: string): Promise<{ code: ErrorCode, role: UnitRole }> {
        if (this.gameIdMap.has(gameId)) {
            if (token == undefined || (this.gameIdMap.get(gameId) as UnitRole).token == token) {
                return { code: ErrorCode.ok, role: this.gameIdMap.get(gameId) as UnitRole };
            }
            else {
                throw ({ code: ErrorCode.role_token_error, errMsg: 'token 错误' });
            }
        }

        // 重新下载玩家
        return new Promise(function (resolve, reject) {
            MongodbMoudle.get_database(DBDefine.db).get_unit<{ [key: string]: any }>(DBDefine.col_role, { _id: gameId }).load().then(function (dbInfo) {
                if (dbInfo.empty) {
                    // 这里需要创角
                    reject({ code: ErrorCode.role_no });
                }
                else {
                    // 这里ok了
                    UnitRole.createLoad(gameId, dbInfo).then(role => {
                        if (token == undefined || role.token == token) {
                            resolve({ code: ErrorCode.ok, role: UnitRole.get(gameId) });
                        }
                        else {
                            reject({ code: ErrorCode.role_token_error, errMsg: 'token 错误' });
                        }
                    }).catch(function () {
                        reject({ code: ErrorCode.role_token_error, errMsg: 'token 错误' });
                    });

                }
            }).catch(function (res) {
                // 异常了，这里需要推出
                // console.log(res);
                reject({ code: ErrorCode.db_error, errMsg: res });
            })
        })
    }

    // 创建一个对象
    private static async createLoad(gameId: string, db: ReHash<{ [key: string]: (string | number | object) }>) {
        if (UnitRole.gameIdMap.has(gameId)) return UnitRole.gameIdMap.get(gameId) as UnitRole;
        let role = new UnitRole();
        role.dbInfo = db;
        role.gameId = gameId;

        // 读取邮件
        await role.loadMail();
        // 读取任务
        await role.loadTask();

        UnitRole.gameIdMap.set(gameId, role);
        // 通知一下其他人
        gameRPC.inst.bcRemoveRole(gameId);
        return role;
    }

    // 加载邮件
    async loadMail() {
        const v = await MongodbMoudle.get_database(DBDefine.db).get_list<ifMailInfo>(DBDefine.col_mail, { ownerId: this.gameId }).load();
        this.mailInfos = v.value;
        for (let i = 0; i < this.mailInfos.length; i++) {
            let rMail = this.mailInfos[i];
        }
    }

    // 加载任务
    async loadTask() {
        const v = await MongodbMoudle.get_database(DBDefine.db).get_unit<{ [taskId: string]: ifTaskInfo }>(DBDefine.col_task, { _id: this.gameId }).load();
        this.taskInfos = v;
    }

    // 登录前操作
    public async beforeLogin() {

        // 重置每日数据
        // await this.resetDailyData();

        // 自动领取每日签到奖励
        // this.getSigninAward();

        // 应用系统邮件
        // await this.applySystemMail();

        // 保存登录日志
        // LoggerMoudle.roleLogin(this.gameId, this.uid, this.activityId, inviterId);
    }

    // 注册流程
    static registRole(gameId: string, playerName: string, pwd: string): Promise<{ code: number, role: UnitRole }> {
        // 检查缓存池中是否有该玩家
        if (this.gameIdMap.has(gameId)) throw ({ code: ErrorCode.role_exist });

        return new Promise(function (resolve, reject) {
            MongodbMoudle.get_database(DBDefine.db)
                .update_insert(DBDefine.col_role, { _id: gameId },
                    {
                        playerName: playerName,
                        pwd: pwd,
                        gameId: gameId,
                    })
                .then(function () {
                    UnitRole.getRole(gameId).then((rs) => {

                        // 初始化角色数据
                        UnitRole.initRoleData(gameId);

                        // 保存注册日志
                        LoggerMoudle.roleRegist(gameId, playerName, pwd);

                        resolve(rs);
                    }).catch(reject);
                }).catch(reject)
        })
    }

    // 初始化玩家数据
    static async initRoleData(gameId: string) {
        let role = this.gameIdMap.get(gameId);
        if (role) {
            // 新手标记
            role.isNew = true;
            role.isCreatorGod = false;
        }
    }

    // 删除角色
    static del(gameId: string) {

        let t_info = this.gameIdMap.get(gameId);
        if (!t_info) return false;

        this.gameIdMap.delete(t_info.gameId);
        return true;
    }

    // 更新道具数量
    updateItemCount(itemId: string, newCount: number) {

        let items = this.dbInfo.get('playerItems') || {};
        items[itemId] = newCount;
        this.dbInfo.set('playerItems', items);

        // 如果是平台物品则直接通知平台
        // PlatformNet.sendItem(this.gameId, itemId, newCount, this.uid, this.activityId);    

        return { code: ErrorCode.ok }
    }

    // 获取道具数量
    getItemCount(itemId: string): number {
        // let items = this.dbInfo.get('playerItems') || {};
        // 如果道具是体力，刷新下体力值
        // if (itemId == UnitRole.STRENGTH_ITEM_ID) {
        //     this.updateStrength(items[itemId] || 0);
        // }

        let newItems = this.dbInfo.get('playerItems') || {};
        return newItems[itemId] || 0;
    }

    // 获取成就数据列表
    get achievementDataList(): ifAchievementInfo[] {
        // 初始化成就数据
        this.initAchievementData();

        // 包含各个成就状态信息的数组
        let retArray: ifAchievementInfo[] = [];
        let v = this.achievementInfos.value;
        for (let key in v) {
            retArray.push(v[key]);
        }
        return retArray;
    }

    // 初始化成就数据，完成返回真
    initAchievementData(): boolean {
        let updated: boolean = false;
        // 读取表中所有成就
        let allAchievementRes: { [key: string]: SeResAchievement } = TableMgr.inst.getAllAchievementRes();

        for (let key in allAchievementRes) {
            // 匹配成就
            let acRes: SeResAchievement = allAchievementRes[key];
            updated = this.checkAndUpdateAchievementData(acRes, 0);
        }

        return updated;
    }

    // 检查并更新成就数据
    private checkAndUpdateAchievementData(acRes: SeResAchievement, updateVal: number): boolean {
        let acId: string = acRes.sID;
        let roleAcDatas = this.achievementInfos.value;

        let needSaveDB: boolean = false;

        let curAcData: ifAchievementInfo = roleAcDatas[acId];
        // 新增成就数据
        if (!curAcData) {
            curAcData = { acId: acId, completeVaule: 0, awardStages: [] };
            needSaveDB = true;
        }

        if (!curAcData) {
            // 理论上不应该出现
            return needSaveDB;
        }

        let updated: boolean = false;

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

    // 更新成就完成次数
    private updateAchievementCompleteValue(acData: ifAchievementInfo, acRes: SeResAchievement, updateVal: number): boolean {
        let updated: boolean = false;
        
        if (updateVal <= 0) {
            return updated;
        }

        switch (acRes.eType) {
            case SeEnumAchievementeType.IU_FenZhi:
                acData.completeVaule += updateVal;
                updated = true;
                break;
            case SeEnumAchievementeType.IU_ZhuXian:
                acData.completeVaule += updateVal;
                updated = true;
                break;
        }

        return updated;
    }

    // 按成就类型触发更新成就信息
    TriggerCheckAchievementByType(achievementType: SeEnumAchievementeType, updateVal: number) {
        // 获取指定类型成就配置信息
        let acResList: SeResAchievement[] = TableMgr.inst.getAchievementResByType(achievementType);
        if (acResList.length <= 0) {
            return;
        }

        for (let i: number = 0; i < acResList.length; ++i) {
            let acRes = acResList[i];
            if (acRes.eType !== achievementType) {
                continue;
            }
            this.updateAchievement(acResList[i], updateVal);
        }
    }

    private updateAchievement(acRes: SeResAchievement, updateVal: number): boolean {
        let updated = this.checkAndUpdateAchievementData(acRes, updateVal);
        return updated;
    }

    // 加载/初始化成就列表
    async loadAchievement() {
        const v = await MongodbMoudle.get_database(DBDefine.db).get_unit<{ [acId: string]: ifAchievementInfo }>(DBDefine.col_achievement, { _id: this.gameId }).load();
        this.achievementInfos = v;
    }

    // 获取成就列表[返给客户端用的]
    async getAchievementList(): Promise<ifAchievementInfo[]> {
        if (!this.achievementInfos) {
            await this.loadAchievement();
        }

        let retList: ifAchievementInfo[] = this.achievementDataList;

        return retList;
    }

    // 领取成就奖励
    async getAchievementAward(acId: string, stage: number) {
        if (!this.achievementInfos) {
            await this.loadAchievement();
        }

        // 获取成就配置信息
        let acRes: SeResAchievement = TableMgr.inst.getAchievementResById(acId);
        if (!acRes) {
            throw { code: ErrorCode.achievement_table_res_fail, errMsg: 'achievement table res fail' }
        }

        // 检查是否存在对应的阶段
        let stageCondition = TableMgr.inst.getAchievementStageCondition(acRes, stage);
        if (stageCondition < 0) {
            throw { code: ErrorCode.achievement_invalid_stage, errMsg: 'achievement invalid stage' }
        }

        // 获取当前成就数据
        let roleAcDatas = this.achievementInfos.value;
        let curAcData: ifAchievementInfo = roleAcDatas[acId];
        if (!curAcData) {
            throw { code: ErrorCode.achievement_invalid_data, errMsg: 'achievement invalid data' }
        }

        // 检查是否已经领取对应的阶段奖励
        for (let i = 0; i < curAcData.awardStages.length; ++i) {
            let completeCondition = curAcData.awardStages[i];
            if (completeCondition === stageCondition) {
                // 说明已经领取过奖励了
                throw { code: ErrorCode.achievement_repeat_award, errMsg: 'achievement repeat award' }
            }
        }

        // 检查玩家是否已经达到领取条件
        if (curAcData.completeVaule < stageCondition) {
            throw { code: ErrorCode.achievement_not_complete, errMsg: 'achievement no complete' }
        }

        // 获取奖励物品列表
        let awardItems: string[] = TableMgr.inst.getAchievementAwardItems(acRes, stage);
        if (!awardItems || awardItems.length <= 0) {
            throw { code: ErrorCode.achievement_table_res_fail, errMsg: 'achievement table res fail' }
        }

        // 更新成就数据
        curAcData.awardStages.push(stageCondition);
        this.achievementInfos.set(acId, curAcData);

        // 下放奖励物品
        for (let i = 0; i < awardItems.length; ++i) {
            let awardItemString: string = awardItems[i];
            let awardItem: Array<string> = awardItemString.split(',');
            if (awardItem.length !== 2) {
                continue;
            }
            let awardItemId = awardItem[0];
            let awardItemCount = parseInt(awardItem[1]);
            this.updateItemCount(awardItemId, this.getItemCount(awardItemId) + awardItemCount);
        }

        // 返回结果
        return { code: ErrorCode.ok };
    }

}