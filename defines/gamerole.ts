
export interface ifTaskInfo {
    // 任务id
    taskId: string,
    // 数值
    value: number,
    // 任务状态
    status: TaskStatus,
    // 更新时间
    updateTime: number,
    // 额外信息
    extra: {},
}

export enum TaskStatus {
    UnComplete = 1,
    CanReward = 2,
    Rewarded = 3,
}

// 成就信息
export interface ifAchievementInfo {
    acId: string;                   // 成就id
    completeVaule: number;          // 完成值
    awardStages: Array<number>;     // 已经领取奖励的阶段
}

export interface ifMailInfo {
    /** 邮件类型 */
    type: eMailType,
    // 邮件的id唯一
    mailId: string,
    // 收件人
    ownerId: string,
    // 发件人ID
    senderId: string,
    // 内容
    message: ifMailContent,
    // 发件时间
    time: number,
    // 邮件状态
    state: number
}

export interface ifMailContent {
    // 邮件类型
    type: eMailFunctionType,
    date: number,
    // 邮件标题
    title: string;
    // 发件人姓名
    senderName: string,
    senderAvatar: string,
    // 发件内容
    content: string;
    // 奖励内容
    rewardItems: Array<string>;
    // 是否已读
    read: boolean;
    claimed: boolean;
    extra?: any;
}

export enum eMailFunctionType {
    /** 好友分享奖励 */
    FriendShareReward,
}

export enum eMailType {
    /** 系统邮件 */
    System,
    /** 用户邮件 */
    User,
    /**道具邮件 */
    Proto,
}

export interface ifUnitRole {
    // 玩家姓名
    playerName: string,
    // 玩家密码
    pwd: string,
    // gameid
    gameId: string,
    // 是否新手
    isNewPlayer: boolean,
    // 是否创世神
    isCreatorGod: boolean,
    // 任务列表
    task: ifTaskInfo[],
    // 邮件列表
    mail: ifMailInfo[],
    // 道具列表
    items: {
        [itemId: string]: number,
    },
    // 气息
    breath: number,
    // 最后登录时间
    lastActivityTime: number,

}