// 成就类型
export enum SeEnumAchievementeType {
      IU_ZhuXian = 1,
      IU_FenZhi = 2
}

// 成就信息
export interface SeResAchievement{ 
      sID:string;
      // 任务类型编号
      eType:SeEnumAchievementeType;
      // 提示描述
      asDescribe:Array<string>;
      // 条件数量
      aiCondition:Array<number>;
      // 成就奖励
      asGiftitems:Array<string>;
}