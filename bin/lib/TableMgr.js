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
        this._signList = [];
        this._mflsTaskList = [];
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
            this._global = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("Global"));
            this._item = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("Item"));
            this._sign = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("Sign"));
            this._task = mx_resource_1.ResourceModule.watch(PltFileList.get_plt_file("Task"));
            this.initSignList();
            return true;
        });
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
}
exports.TableMgr = TableMgr;
//# sourceMappingURL=TableMgr.js.map