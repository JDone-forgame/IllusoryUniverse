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
        this._global = ResourceModule.watch<SeResGlobal>(PltFileList.get_plt_file("Global"));
        this._item = ResourceModule.watch<SeResItem>(PltFileList.get_plt_file("Item"));
        this._sign = ResourceModule.watch<SeResSign>(PltFileList.get_plt_file("Sign"));
        this._task = ResourceModule.watch<SeResTask>(PltFileList.get_plt_file("Task"));

        this.initSignList();
        return true;
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

}