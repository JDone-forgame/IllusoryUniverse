
import { ResourceModule } from "mx-resource";

import { SeEnumTaskeTaskType, SeResAddWater, SeResExperience, SeResGlobal, SeResItem, SeResSign, SeResTask, SeResNutrientExp } from "../defines/interface";
import { ConfigMgr } from "mx-tool";
import { readFileSync } from "fs";
import { join } from "path";

class PltFileList {
    private _file_list: string[] = [];
    private _tablePath: string = "res/table/";
    static _inst: PltFileList;

    public static get_plt_file(filename: string, plt?: string) {
        if (!this._inst) {
            this._inst = new PltFileList();
        }
        let channelName: string = ConfigMgr.get('channel');
        return this._inst.get_plt_file(filename, channelName);
    }

    constructor() {
        this.readFileList();
    }

    private readFileList() {
        try {
            var read_data = readFileSync(join(this._tablePath, '_filelist_.json'));
            var js_data = JSON.parse(read_data.toString());
            this._file_list = js_data['_files_'] || [];
        }
        catch (e) {

        }
    }

    private get_plt_file(filename: string, plt: string): string {
        let pltFile: string = filename + '_' + plt + '.json';
        if (this._file_list.indexOf(pltFile) >= 0) {
            return join(this._tablePath, pltFile);
        }
        return join(this._tablePath, filename + ".json");
    }
}

export class TableMgr {
    name = "TableMgr"
    private static _inst: TableMgr;
    public static get inst(): TableMgr {
        if (!this._inst) {
            this._inst = new TableMgr();
        }
        return this._inst;
    }

    private constructor() {

    }


    /**
     * 加载所有表格
     */
    public async init() {
        this._addWater = ResourceModule.watch<SeResAddWater>(PltFileList.get_plt_file("AddWater"));
        this._experience = ResourceModule.watch<SeResExperience>(PltFileList.get_plt_file("Experience"));
        this._global = ResourceModule.watch<SeResGlobal>(PltFileList.get_plt_file("Global"));
        this._item = ResourceModule.watch<SeResItem>(PltFileList.get_plt_file("Item"));
        this._sign = ResourceModule.watch<SeResSign>(PltFileList.get_plt_file("Sign"));
        this._task = ResourceModule.watch<SeResTask>(PltFileList.get_plt_file("Task"));
        this._nutrientExp = ResourceModule.watch<SeResNutrientExp>(PltFileList.get_plt_file("NutrientExp"));

        this.initExperienceList();
        this.initAddWaterList();
        this.initSignList();
        this.initMflsTaskList();
        this.initNutrientList();
        return true;
    }

    /**
     * 积水
     */
    private _addWater: ResourceModule<SeResAddWater>;
    private _addWaterList: Array<SeResAddWater> = [];
    /**
     * 将积水配置保存到列表中
     */
    private initAddWaterList(): void {
        let res: { [tkey: string]: SeResAddWater } = this._addWater.getAllRes();
        for (let id in res) {
            let configInfo: SeResAddWater = res[id];
            this._addWaterList.push(configInfo);
        }
    }

    /**
     * 按照每日浇水次数获取进入集水器的水量
     * @param waterCount 
     */
    public getAddWaterByCount(waterCount: number): number {
        let addWater = 0;

        for (let i = 0; i < this._addWaterList.length; ++i) {
            let res = this._addWaterList[i];
            addWater = res.iAddWater;
            if (waterCount <= res.iAddWaterMax) {
                break;
            }
        }

        return addWater;
    }

    /**
     * 成长阶段
     */
    private _experience: ResourceModule<SeResExperience>;
    private _experienceList: Array<SeResExperience> = [];

    /**
     * 将阶段配置保存到列表中
     */
    private initExperienceList(): void {
        let res: { [tkey: string]: SeResExperience } = this._experience.getAllRes();

        let prevExperience = 0;
        for (let id in res) {
            let configInfo: SeResExperience = res[id];
            configInfo.iExperience += prevExperience;
            prevExperience = configInfo.iExperience;
            this._experienceList.push(configInfo);
        }
    }

    /**
     * 通过树的经验得到对应的阶段
     * @param score 
     */
    public getPlantStageByScore(score: number): number {
        let stage: number = -1;

        for (let i = 0; i < this._experienceList.length; ++i) {
            let res = this._experienceList[i];
            stage = i;
            if (score < res.iExperience) {
                break
            }
        }

        return stage
    }

    /**
      * 当前阶段的经验值
      * @param score
      */
    public getPlantScoreByCurStage(score: number, stage: number): number {
        let res = this._experienceList[stage - 1];
        score = score - res.iExperience;
        return score
    }

    /**
     * 是否达到最后阶段
     * @param stage 
     */
    public isFinalStage(stage: number) {
        if (stage + 1 == this._experienceList.length) {
            return true;
        }
        return false;
    }

    /**
     * 获取达到最终大奖需要的经验
     * @param score 
     */
    public getFinalAwardScore(): number {
        let score = -1;

        let listLen = this._experienceList.length;
        if (listLen > 0) {
            score = this._experienceList[listLen - 1].iExperience;
        }

        return score;
    }

    /**
     * 获取对应阶段浇水获取的经验
     * @param stage 
     */
    public getAddScoreByStage(stage: number): number {
        let addScore = 0;

        if (stage < 0 || stage >= this._experienceList.length) {
            return addScore;
        }

        let stageRes = this._experienceList[stage];
        if (!stageRes) {
            return addScore;
        }

        if (stageRes.aiAddEx.length <= 0 || stageRes.aiAddEx.length != stageRes.aiAddWeight.length) {
            return addScore;
        }

        if (stageRes.aiAddEx.length == 1) {
            return stageRes.aiAddEx[0];
        }

        // 计算总权重
        let totalWeight = 0;
        for (let i = 0; i < stageRes.aiAddWeight.length; ++i) {
            totalWeight += stageRes.aiAddWeight[i];
        }

        // 按权重随机获取经验值
        let remainDistance = Math.random() * totalWeight;
        for (let i = 0; i < stageRes.aiAddWeight.length; ++i) {
            remainDistance -= stageRes.aiAddWeight[i];
            if (remainDistance < 0) {
                addScore = stageRes.aiAddEx[i];
                break;
            }
        }

        return addScore;
    }

    public getStageAward(stage: number): Array<string> {
        let award: Array<string> = [];

        if (stage < 0 || stage >= this._experienceList.length) {
            return award;
        }

        let stageRes = this._experienceList[stage];
        if (!stageRes) {
            return award;
        }

        return stageRes.asGift;
    }

    /**
     * 全局配置
     */
    private _global: ResourceModule<SeResGlobal>;

    /**
     * 获取全局配置id
     * @param sKey 
     */
    public getGlobalConfig(sKey: string): string {
        let res: { [tkey: string]: SeResGlobal } = this._global.getAllRes();
        for (let id in res) {
            let configInfo: SeResGlobal = res[id];
            if (configInfo && configInfo.sGlobalType == sKey) {
                return configInfo.sGlobalData;
            }
        }
        return "";
    }

    /**
     * 物品
     */
    private _item: ResourceModule<SeResItem>;

    public getItemInfo(sId: string): SeResItem {
        let res: { [tkey: string]: SeResItem } = this._item.getAllRes();
        for (let id in res) {
            let configInfo: SeResItem = res[id];
            if (configInfo && configInfo.sID == sId) {
                return configInfo;
            }
        }
        return null;
    }

    /**
     * 签到
     */
    private _sign: ResourceModule<SeResSign>
    private _signList: Array<SeResSign> = []

    /**
     * 将签到配置保存到列表中
     */
    private initSignList() {
        this._signList = [];
        let res: { [tkey: string]: SeResSign } = this._sign.getAllRes();
        for (let id in res) {
            let configInfo: SeResSign = res[id];
            this._signList.push(configInfo);
        }
    }

    /**
    * 获取下一轮的签到配置ID
    * @param curSignID
    */
    public getNextSignID(curSignID: string) {
        let nextSignID: string = "";
        if (this._signList.length <= 0) {
            return nextSignID;
        }

        if (!curSignID || curSignID == "") {
            return this._signList[0].sID;
        }

        let curSignIndex: number = -1;
        for (let i = 0; i < this._signList.length; ++i) {
            let config = this._signList[i];
            if (config.sID === curSignID) {
                curSignIndex = i;
                break;
            }
        }

        let nextSignIndex = curSignIndex + 1;
        if (nextSignIndex < 0 || nextSignIndex >= this._signList.length) {
            nextSignIndex = 0;
        }

        return this._signList[nextSignIndex].sID;
    }

    public getNextSignAwardByID(signID: string) {
        let award: Array<string> = [];

        let allRes: { [tkey: string]: SeResSign } = this._sign.getAllRes();
        if (!allRes[signID]) {
            return award;
        }

        let signRes = allRes[signID];
        if (!signRes) {
            return award;
        }

        // 说明同时配了两组奖励，需要由玩家选择
        if (signRes.asGiftOne && signRes.asGiftTwo) {
            return award;
        }

        if (signRes.asGiftOne) {
            return signRes.asGiftOne;
        } else {
            return signRes.asGiftTwo;
        }
    }

    public getSignAwardByIndex(signID: string, index: number) {
        let award: Array<string> = [];

        let signRes = this._sign.getRes(signID);
        if (!signRes) {
            return award;
        }

        if (index == 0) {
            return signRes.asGiftOne;
        } else {
            return signRes.asGiftTwo;
        }
    }

    /**
     * 任务
     */
    private _task: ResourceModule<SeResTask>;
    private _mflsTaskList: Array<SeResTask> = []

    /**
     * 将免费领水任务保存到列表中
     */
    private initMflsTaskList() {
        let res: { [tkey: string]: SeResTask } = this._task.getAllRes();
        for (let id in res) {
            let configInfo: SeResTask = res[id];
            if (configInfo.eTaskType === SeEnumTaskeTaskType.MianFeiLingShui) {
                this._mflsTaskList.push(configInfo);
            }
        }
    }

    /**
     * 获取第一个免费领水任务ID
     */
    public getFirstMflsTaskRes(): SeResTask {
        let taskRes = null;

        if (this._mflsTaskList.length > 0) {
            taskRes = this._mflsTaskList[0];
        }

        return taskRes;
    }

    public getNextMflsTaskRes(curTaskID: string): SeResTask {
        let taskRes = null;

        for (let i = 0; i < this._mflsTaskList.length; ++i) {
            if (this._mflsTaskList[i].sUnlock == curTaskID) {
                taskRes = this._mflsTaskList[i];
                break;
            }
        }

        return taskRes;
    }

    /**
     * 获取所有的任务列表
     */
    public getAllTaskRes(): { [key: string]: SeResTask } {
        return this._task.getAllRes();
    }

    /**
     * 通过任务id获取任务信息
     * @param taskId 
     */
    public getTaskResById(taskId: string): SeResTask {
        return this._task.getRes(taskId) as SeResTask;
    }

    /**
     * 获取指定类型的任务
     * @param nType 
     */
    public getTaskInfoByType(nType: SeEnumTaskeTaskType): SeResTask[] {
        let res: { [tkey: string]: SeResTask } = this._task.getAllRes();
        let ret: SeResTask[] = []
        for (let taskId in res) {
            let taskInfo: SeResTask | undefined = res[taskId];
            if (taskInfo && taskInfo.eTaskType == nType) {
                ret.push(taskInfo);
            }
        }

        return ret;
    }

    /**
     * 养分经验
     */
    private _nutrientExp: ResourceModule<SeResNutrientExp>;
    private _nutrientExpList: Array<SeResNutrientExp> = [];

    /**
     * 将养份配置信息保存到列表中
     */
    private initNutrientList() {
        let res: { [tkey: string]: SeResNutrientExp } = this._nutrientExp.getAllRes();
        for (let id in res) {
            let configInfo: SeResNutrientExp = res[id];
            this._nutrientExpList.push(configInfo);
        }
    }

    /**
     * 按当前养份获取对应配置信息
     * @param curNutrient 
     */
    public getNutrientExpRes(curNutrient: number) {
        let foundRes: SeResNutrientExp = null;
        if (this._nutrientExpList.length <= 0) {
            return foundRes;
        }
        for (let i = 0; i < this._nutrientExpList.length; ++i) {
            let config = this._nutrientExpList[i];
            if (curNutrient >= config.iMinNutrient && curNutrient <= config.iMaxNutrient) {
                foundRes = config;
                break;
            }
        }

        if (!foundRes) {
            foundRes = this._nutrientExpList[0];
        }

        return foundRes;
    }

    /**
     * 获取最后阶段可以获取的额外经验
     * @param config 
     */
    public getFinalStageAddScore(config: SeResNutrientExp): number {
        let addScore = 0;

        if (!config) {
            return addScore;
        }

        if (config.aiAddEx.length <= 0 || config.aiAddEx.length != config.aiAddWeight.length) {
            return addScore;
        }

        if (config.aiAddEx.length == 1) {
            return config.aiAddEx[0];
        }

        // 计算总权重
        let totalWeight = 0;
        for (let i = 0; i < config.aiAddWeight.length; ++i) {
            totalWeight += config.aiAddWeight[i];
        }

        // 按权重随机获取经验值
        let remainDistance = Math.random() * totalWeight;
        for (let i = 0; i < config.aiAddWeight.length; ++i) {
            remainDistance -= config.aiAddWeight[i];
            if (remainDistance < 0) {
                addScore = config.aiAddEx[i];
                break;
            }
        }

        return addScore;
    }
}