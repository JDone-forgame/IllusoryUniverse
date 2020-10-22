import { ConfigMgr } from "mx-tool";

export var DBDefine = {
    db: ConfigMgr.get('db.database') || "IllusoryUniverse",
    col_role: 'roles',
    col_task: 'tasks',
    col_achievement: 'achievement',
    col_mail: 'mails',
    col_board: "board",
    col_friend: "friend",
}

export enum ErrorCode {
    ok = 0,
    param_error = 1,
    appid_error = 2,
    session_key_error = 3,
    pwd_is_wrong = 4,

    db_not_ready = 10,
    db_error = 11,

    account_no = 1001,
    account_passwd_error = 1002,
    account_exist = 1003,

    account_load_error = 1010,

    api_error = 2001,
    api_query_error = 2002,
    api_result_error = 2003,

    //榜单业务
    rank_error = 5000,
    rank_active_not_open = 5010,
    rank_active_not_exist = 5011,

    role_no = 10001,
    role_exist = 10004,
    role_token_error = 10005,
    role_no_mail = 10006,
    role_no_taskId = 10007,
    role_no_taskType = 10008,
    role_no_engough_diamond = 10009,
    role_no_nickname = 10010,

    login_error = 10011,

    // 任务相关
    task_award_not_find_record = 10600,
    task_invalid_res = 10601,
    task_already_get_award = 10602,
    task_award_uncomplete = 10603,

    // 主界面
    home_choppingboard_no_pos = 10080,
    role_no_enough_gold = 10081,
    home_merge_fail = 10082,
    home_sale_knife_not_exist = 10083,
    home_change_knife_over_lvl = 10084,
    
    // 商店
    shop_buy_knife_no_config = 10090,
    config_not_found = 10091,

    // 广告
    ad_reach_limit_count = 10100,
    ad_award_invalid_type = 10101,

    // 兑换
    exchange_faild = 10200,

    // 游戏结算
    game_result_fail = 20000,
    game_start_fail =  20001,
    level_reward_fail = 20002,
    game_result_validate_fail = 20003,
    game_result_level_data_validate_fail = 20004,
    game_result_checkpoint_data_validate_fail = 20005,
    game_result_block_data_validate_fail = 20006,
    game_start_not_enough_items = 20007,
    game_start_use_items_fail = 20008,

    gm_tool_execute_error = 20200,


    team_create_fail = 30000,
    team_not_exist =   30001,
    team_member_not_exist = 30002,
    team_join_fail = 30003,
    team_reward_fail = 30004,
    team_kick_fail = 30005,

    game_use_pro_fail = 30010,


    rank_list_error = 30020,
    rank_update_error = 30021,

    mail_get_reward_fial = 30030,

    activity_reward_fail = 30040,
    add_prop_fial = 30041,

    resurrection_fail = 30042,

    // 消息订阅
    subscribe_create_msgdata_fail = 30100,
    subscribe_repeat_msg_fail = 30101,
    subscribe_no_role_fail = 30102,
    subscribe_access_token_fail = 30102,

    // 购买相关
    buy_table_res_fail = 30200,
    buy_not_enough_money = 30201,

    // 成就相关
    achievement_table_res_fail = 30300,
    achievement_invalid_stage = 30301,
    achievement_invalid_data = 30302,
    achievement_repeat_award = 30303,
    achievement_not_complete = 30304,

    // 签到相关
    signin_record_not_exist = 30400,
    signin_already_complete = 30401,
    signin_invalid_res = 30402, 
}