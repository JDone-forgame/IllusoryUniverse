
import { ResourceModule } from "mx-resource";

import { SeResAchievement, SeEnumAchievementeType, SeResTask, SeEnumTaskeTaskType } from "../defines/interface";
import { ConfigMgr } from "mx-tool";
import { readFileSync } from "fs";
import { join } from "path";

class PltFileList {
    private _file_list: string[] = [];
    private _tablePath : string = "res/table/";
    static _inst: PltFileList;

    public static get_plt_file(filename: string, plt?: string) {
        if (!this._inst) {
            this._inst = new PltFileList();
        }
        let channelName : string =  ConfigMgr.get('channel');
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

    private get_plt_file(filename: string, plt : string) : string{
        let pltFile : string = filename + '_' + plt + '.json';
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
        this._achievement = ResourceModule.watch<SeResAchievement>(PltFileList.get_plt_file("Achievement"));
        this._task = ResourceModule.watch<SeResTask>(PltFileList.get_plt_file("Task"));
        return true;
    }

    /**
     * 成就
     */
    private _achievement: ResourceModule<SeResAchievement>;


    /**
     * 通过成就id获取成就资源
     * @param taskId 
     */
    public getAchievementResById(acId: string): SeResAchievement {
        return this._achievement.getRes(acId) as SeResAchievement;
    }

    /**
     * 获取所有的成就列表
     */
    public getAllAchievementRes(): { [key: string]: SeResAchievement } {
        return this._achievement.getAllRes();
    }

    /**
     * 获取指定类型的成就信息
     * @param type 
     */
    public getAchievementResByType(type: SeEnumAchievementeType): SeResAchievement[] {
        let res: { [tkey: string]: SeResAchievement } = this._achievement.getAllRes();
        let ret: SeResAchievement[] = []
        for (let acId in res) {
            let acRes: SeResAchievement | undefined = res[acId];
            if (acRes && acRes.eType == type) {
                ret.push(acRes);
            }
        }

        return ret;
    }

    // 得到完成指定阶段成就的条件值
    public getAchievementStageCondition(acRes: SeResAchievement, stage: number) {
        let condValue: number = -1;
        if (stage >= acRes.aiCondition.length) {
            return condValue;
        }

        condValue = acRes.aiCondition[stage];
        return condValue;
    }

    // 获取指定成就阶段奖励物品列表
    public getAchievementAwardItems(acRes: SeResAchievement, stage: number) {
        let awardItems: string[] = [];
        if (stage >= acRes.asGiftitems.length) {
            return awardItems;
        }

        let awardString: string = acRes.asGiftitems[stage];
        awardItems = awardString.split(";");

        return awardItems;
    }

    // 任务
    private _task: ResourceModule<SeResTask>;
    // 获取所有的任务列表
    public getAllTaskRes(): { [key: string]: SeResTask } {
        return this._task.getAllRes();
    }
    // 获取指定类型的任务
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

    // 通过任务id获取任务信息
    public getTaskResById(taskId: string): SeResTask {
        return this._task.getRes(taskId) as SeResTask;
    }

}