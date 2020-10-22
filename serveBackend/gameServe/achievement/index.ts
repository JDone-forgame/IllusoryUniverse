import { ErrorCode } from "../../../defines/defines";
import { UnitRole } from "../gamerole/role";

export class AchievementService {
    public static init() {
        return Promise.resolve();
    }

    // 获取成就列表
    static async getAchievementList(gameId: string, token: string) {

        let roleResult = await UnitRole.getRole(gameId, token);
        if (!roleResult || !roleResult.role) {
            return Promise.reject({ code: ErrorCode.role_no, errMsg: "role is not found!" });
        }

        let retList = await roleResult.role.getAchievementList();

        return { code: ErrorCode.ok, achieveList: retList };
    }


    // 领取成就奖励
    static async getAchievementAward(gameId: string, token: string, acId: string, stage: number) {
        let roleResult = await UnitRole.getRole(gameId, token);
        if (!roleResult) {
            return Promise.reject({ code: ErrorCode.role_no, errMsg: "role is not found!" });
        }
        let role = roleResult.role;

        let result = await role.getAchievementAward(acId, stage);
        let acDataList = await role.getAchievementList();
        return { code: ErrorCode.ok, acId: acId, stage: stage, acList: acDataList, allItems: role.playerItems };
    }
}