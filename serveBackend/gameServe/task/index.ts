import { ErrorCode } from "../../../defines/defines";
import { UnitRole } from "../gamerole/role";



export class TaskService {

    public static init() {
        return Promise.resolve();
    }

    /**
     * 获取任务列表
     * @param gameId 
     * @param token 
     */
    static async getTaskList(gameId: string, token: string) {

        let ret = await UnitRole.getRole(gameId, token);
        if (!ret || !ret.role) {
            return Promise.reject({ code: ErrorCode.role_no, errMsg: "role is not found!" });
        }

        let taskList = await ret.role.getTaskList();

        return { code: ErrorCode.ok, taskList: taskList };
    }

    /**
     * 领取任务奖励
     * @param gameId 
     * @param token 
     * @param taskId 
     */
    static async getTaskAward(gameId: string, token: string, taskId: string) {
        let ret = await UnitRole.getRole(gameId, token);
        if (!ret) {
            return Promise.reject({ code: ErrorCode.role_no, errMsg: "role is not found!" });
        }

        let role = ret.role;

        // 领取奖励
        let result = await role.getTaskAward(taskId);

        // 获取任务列表
        let newTaskList = await role.getTaskList();

        // 返回结果
        return { code: ErrorCode.ok, newTaskList: newTaskList, items: role.playerItems, awardItems: result.awardItems };
    }
}