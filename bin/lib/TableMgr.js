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
            this._achievement = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("Achievement"));
            this._task = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("Task"));
            return true;
        });
    }
    /**
     * 通过成就id获取成就资源
     * @param taskId
     */
    getAchievementResById(acId) {
        return this._achievement.getRes(acId);
    }
    /**
     * 获取所有的成就列表
     */
    getAllAchievementRes() {
        return this._achievement.getAllRes();
    }
    /**
     * 获取指定类型的成就信息
     * @param type
     */
    getAchievementResByType(type) {
        let res = this._achievement.getAllRes();
        let ret = [];
        for (let acId in res) {
            let acRes = res[acId];
            if (acRes && acRes.eType == type) {
                ret.push(acRes);
            }
        }
        return ret;
    }
    // 得到完成指定阶段成就的条件值
    getAchievementStageCondition(acRes, stage) {
        let condValue = -1;
        if (stage >= acRes.aiCondition.length) {
            return condValue;
        }
        condValue = acRes.aiCondition[stage];
        return condValue;
    }
    // 获取指定成就阶段奖励物品列表
    getAchievementAwardItems(acRes, stage) {
        let awardItems = [];
        if (stage >= acRes.asGiftitems.length) {
            return awardItems;
        }
        let awardString = acRes.asGiftitems[stage];
        awardItems = awardString.split(";");
        return awardItems;
    }
    // 获取所有的任务列表
    getAllTaskRes() {
        return this._task.getAllRes();
    }
    // 获取指定类型的任务
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
    // 通过任务id获取任务信息
    getTaskResById(taskId) {
        return this._task.getRes(taskId);
    }
}
exports.TableMgr = TableMgr;
//# sourceMappingURL=TableMgr.js.map