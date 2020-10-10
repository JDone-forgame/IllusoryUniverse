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
exports.TableMgr = void 0;
const mx_resource_1 = require("mx-resource");
const interface_1 = require("../defines/interface");
const mx_tool_1 = require("mx-tool");
const fs_1 = require("fs");
const path_1 = require("path");
class PltFileList {
    constructor() {
        this._file_list = [];
        this._tablePath = "res/table/";
        this.readFileList();
    }
    static get_plt_file(filename, plt) {
        if (!this._inst) {
            this._inst = new PltFileList();
        }
        let channelName = mx_tool_1.ConfigMgr.get('channel');
        return this._inst.get_plt_file(filename, channelName);
    }
    readFileList() {
        try {
            var read_data = fs_1.readFileSync(path_1.join(this._tablePath, '_filelist_.json'));
            var js_data = JSON.parse(read_data.toString());
            this._file_list = js_data['_files_'] || [];
        }
        catch (e) {
        }
    }
    get_plt_file(filename, plt) {
        let pltFile = filename + '_' + plt + '.json';
        if (this._file_list.indexOf(pltFile) >= 0) {
            return path_1.join(this._tablePath, pltFile);
        }
        return path_1.join(this._tablePath, filename + ".json");
    }
}
class TableMgr {
    constructor() {
        this.name = "TableMgr";
        this._addWaterList = [];
        this._experienceList = [];
        this._signList = [];
        this._mflsTaskList = [];
        this._nutrientExpList = [];
    }
    static get inst() {
        if (!this._inst) {
            this._inst = new TableMgr();
        }
        return this._inst;
    }
    /**
     * 加载所有表格
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._addWater = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("AddWater"));
            this._experience = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("Experience"));
            this._global = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("Global"));
            this._item = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("Item"));
            this._sign = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("Sign"));
            this._task = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("Task"));
            this._nutrientExp = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("NutrientExp"));
            this.initExperienceList();
            this.initAddWaterList();
            this.initSignList();
            this.initMflsTaskList();
            this.initNutrientList();
            return true;
        });
    }
    /**
     * 将积水配置保存到列表中
     */
    initAddWaterList() {
        let res = this._addWater.getAllRes();
        for (let id in res) {
            let configInfo = res[id];
            this._addWaterList.push(configInfo);
        }
    }
    /**
     * 按照每日浇水次数获取进入集水器的水量
     * @param waterCount
     */
    getAddWaterByCount(waterCount) {
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
     * 将阶段配置保存到列表中
     */
    initExperienceList() {
        let res = this._experience.getAllRes();
        let prevExperience = 0;
        for (let id in res) {
            let configInfo = res[id];
            configInfo.iExperience += prevExperience;
            prevExperience = configInfo.iExperience;
            this._experienceList.push(configInfo);
        }
    }
    /**
     * 通过树的经验得到对应的阶段
     * @param score
     */
    getPlantStageByScore(score) {
        let stage = -1;
        for (let i = 0; i < this._experienceList.length; ++i) {
            let res = this._experienceList[i];
            stage = i;
            if (score < res.iExperience) {
                break;
            }
        }
        return stage;
    }
    /**
      * 当前阶段的经验值
      * @param score
      */
    getPlantScoreByCurStage(score, stage) {
        let res = this._experienceList[stage - 1];
        score = score - res.iExperience;
        return score;
    }
    /**
     * 是否达到最后阶段
     * @param stage
     */
    isFinalStage(stage) {
        if (stage + 1 == this._experienceList.length) {
            return true;
        }
        return false;
    }
    /**
     * 获取达到最终大奖需要的经验
     * @param score
     */
    getFinalAwardScore() {
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
    getAddScoreByStage(stage) {
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
    getStageAward(stage) {
        let award = [];
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
     * 获取全局配置id
     * @param sKey
     */
    getGlobalConfig(sKey) {
        let res = this._global.getAllRes();
        for (let id in res) {
            let configInfo = res[id];
            if (configInfo && configInfo.sGlobalType == sKey) {
                return configInfo.sGlobalData;
            }
        }
        return "";
    }
    getItemInfo(sId) {
        let res = this._item.getAllRes();
        for (let id in res) {
            let configInfo = res[id];
            if (configInfo && configInfo.sID == sId) {
                return configInfo;
            }
        }
        return null;
    }
    /**
     * 将签到配置保存到列表中
     */
    initSignList() {
        this._signList = [];
        let res = this._sign.getAllRes();
        for (let id in res) {
            let configInfo = res[id];
            this._signList.push(configInfo);
        }
    }
    /**
    * 获取下一轮的签到配置ID
    * @param curSignID
    */
    getNextSignID(curSignID) {
        let nextSignID = "";
        if (this._signList.length <= 0) {
            return nextSignID;
        }
        if (!curSignID || curSignID == "") {
            return this._signList[0].sID;
        }
        let curSignIndex = -1;
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
    getNextSignAwardByID(signID) {
        let award = [];
        let allRes = this._sign.getAllRes();
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
        }
        else {
            return signRes.asGiftTwo;
        }
    }
    getSignAwardByIndex(signID, index) {
        let award = [];
        let signRes = this._sign.getRes(signID);
        if (!signRes) {
            return award;
        }
        if (index == 0) {
            return signRes.asGiftOne;
        }
        else {
            return signRes.asGiftTwo;
        }
    }
    /**
     * 将免费领水任务保存到列表中
     */
    initMflsTaskList() {
        let res = this._task.getAllRes();
        for (let id in res) {
            let configInfo = res[id];
            if (configInfo.eTaskType === interface_1.SeEnumTaskeTaskType.MianFeiLingShui) {
                this._mflsTaskList.push(configInfo);
            }
        }
    }
    /**
     * 获取第一个免费领水任务ID
     */
    getFirstMflsTaskRes() {
        let taskRes = null;
        if (this._mflsTaskList.length > 0) {
            taskRes = this._mflsTaskList[0];
        }
        return taskRes;
    }
    getNextMflsTaskRes(curTaskID) {
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
    getAllTaskRes() {
        return this._task.getAllRes();
    }
    /**
     * 通过任务id获取任务信息
     * @param taskId
     */
    getTaskResById(taskId) {
        return this._task.getRes(taskId);
    }
    /**
     * 获取指定类型的任务
     * @param nType
     */
    getTaskInfoByType(nType) {
        let res = this._task.getAllRes();
        let ret = [];
        for (let taskId in res) {
            let taskInfo = res[taskId];
            if (taskInfo && taskInfo.eTaskType == nType) {
                ret.push(taskInfo);
            }
        }
        return ret;
    }
    /**
     * 将养份配置信息保存到列表中
     */
    initNutrientList() {
        let res = this._nutrientExp.getAllRes();
        for (let id in res) {
            let configInfo = res[id];
            this._nutrientExpList.push(configInfo);
        }
    }
    /**
     * 按当前养份获取对应配置信息
     * @param curNutrient
     */
    getNutrientExpRes(curNutrient) {
        let foundRes = null;
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
    getFinalStageAddScore(config) {
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
exports.TableMgr = TableMgr;
//# sourceMappingURL=TableMgr.js.map