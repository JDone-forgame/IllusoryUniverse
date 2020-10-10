import { MongodbMoudle, ReHash } from "mx-database";
import { LocalDate } from "mx-tool";
import { DBDefine, ErrorCode } from "../../../defines/defines";
import { ifMailInfo, ifTaskInfo, ifUnitRole } from "../../../defines/gamerole";
import { SeEnumItemeItemType } from "../../../defines/interface";
import { LoggerMoudle } from "../../../lib/logger";
import { TableMgr } from "../../../lib/TableMgr";
import { gameRPC } from "../../../rpcs/gameRPC";

export class UnitRole {
    static async init() {
        return;
    }

    private static gameIdMap: Map<string, UnitRole> = new Map();

    dbInfo!: ReHash<{ [key: string]: (string | number | object) }>;
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

    set playerName(v: string){
        this.dbInfo.set('playerName', v);
    }

    get pwd(): string {
        return this.dbInfo.get('pwd') || '';
    }

    get gameId(): string {
        return this.dbInfo.get('gameId') || '';
    }

    set gameId(v: string){
        this.dbInfo.set('gameId', v);
    }

    get breath(): number {
        return this.dbInfo.get('breath') || 0;
    }

    set breath(v: number){
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
                throw ({ code: ErrorCode.role_token_error });
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
                            reject({ code: ErrorCode.role_token_error });
                        }
                    }).catch(function () {
                        reject({ code: ErrorCode.role_token_error });
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
        let itemRes = TableMgr.inst.getItemInfo(itemId)
        if (!itemRes) return { code: ErrorCode.ok };

        if (itemRes.eItemType != SeEnumItemeItemType.WaiBuDaoJu) {
            let items = this.dbInfo.get('playerItems') || {};
            items[itemId] = newCount;
            this.dbInfo.set('playerItems', items);
        } else {
            // 如果是平台物品则直接通知平台
            // PlatformNet.sendItem(this.gameId, itemId, newCount, this.uid, this.activityId);
        }

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


}