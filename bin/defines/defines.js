"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.DBDefine = void 0;
const mx_tool_1 = require("mx-tool");
exports.DBDefine = {
    db: mx_tool_1.ConfigMgr.get('db.database') || "IllusoryUniverse",
    col_role: 'roles',
    col_task: 'tasks',
    col_achievement: 'achievement',
    col_mail: 'mails',
    col_board: "board",
    col_friend: "friend",
};
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["ok"] = 0] = "ok";
    ErrorCode[ErrorCode["param_error"] = 1] = "param_error";
    ErrorCode[ErrorCode["appid_error"] = 2] = "appid_error";
    ErrorCode[ErrorCode["session_key_error"] = 3] = "session_key_error";
    ErrorCode[ErrorCode["pwd_is_wrong"] = 4] = "pwd_is_wrong";
    ErrorCode[ErrorCode["db_not_ready"] = 10] = "db_not_ready";
    ErrorCode[ErrorCode["db_error"] = 11] = "db_error";
    ErrorCode[ErrorCode["account_no"] = 1001] = "account_no";
    ErrorCode[ErrorCode["account_passwd_error"] = 1002] = "account_passwd_error";
    ErrorCode[ErrorCode["account_exist"] = 1003] = "account_exist";
    ErrorCode[ErrorCode["account_load_error"] = 1010] = "account_load_error";
    ErrorCode[ErrorCode["api_error"] = 2001] = "api_error";
    ErrorCode[ErrorCode["api_query_error"] = 2002] = "api_query_error";
    ErrorCode[ErrorCode["api_result_error"] = 2003] = "api_result_error";
    //榜单业务
    ErrorCode[ErrorCode["rank_error"] = 5000] = "rank_error";
    ErrorCode[ErrorCode["rank_active_not_open"] = 5010] = "rank_active_not_open";
    ErrorCode[ErrorCode["rank_active_not_exist"] = 5011] = "rank_active_not_exist";
    ErrorCode[ErrorCode["role_no"] = 10001] = "role_no";
    ErrorCode[ErrorCode["role_exist"] = 10004] = "role_exist";
    ErrorCode[ErrorCode["role_token_error"] = 10005] = "role_token_error";
    ErrorCode[ErrorCode["role_no_mail"] = 10006] = "role_no_mail";
    ErrorCode[ErrorCode["role_no_taskId"] = 10007] = "role_no_taskId";
    ErrorCode[ErrorCode["role_no_taskType"] = 10008] = "role_no_taskType";
    ErrorCode[ErrorCode["role_no_engough_diamond"] = 10009] = "role_no_engough_diamond";
    ErrorCode[ErrorCode["role_no_nickname"] = 10010] = "role_no_nickname";
    ErrorCode[ErrorCode["login_error"] = 10011] = "login_error";
    // 任务相关
    ErrorCode[ErrorCode["task_award_not_find_record"] = 10600] = "task_award_not_find_record";
    ErrorCode[ErrorCode["task_invalid_res"] = 10601] = "task_invalid_res";
    ErrorCode[ErrorCode["task_already_get_award"] = 10602] = "task_already_get_award";
    ErrorCode[ErrorCode["task_award_uncomplete"] = 10603] = "task_award_uncomplete";
    // 主界面
    ErrorCode[ErrorCode["home_choppingboard_no_pos"] = 10080] = "home_choppingboard_no_pos";
    ErrorCode[ErrorCode["role_no_enough_gold"] = 10081] = "role_no_enough_gold";
    ErrorCode[ErrorCode["home_merge_fail"] = 10082] = "home_merge_fail";
    ErrorCode[ErrorCode["home_sale_knife_not_exist"] = 10083] = "home_sale_knife_not_exist";
    ErrorCode[ErrorCode["home_change_knife_over_lvl"] = 10084] = "home_change_knife_over_lvl";
    // 商店
    ErrorCode[ErrorCode["shop_buy_knife_no_config"] = 10090] = "shop_buy_knife_no_config";
    ErrorCode[ErrorCode["config_not_found"] = 10091] = "config_not_found";
    // 广告
    ErrorCode[ErrorCode["ad_reach_limit_count"] = 10100] = "ad_reach_limit_count";
    ErrorCode[ErrorCode["ad_award_invalid_type"] = 10101] = "ad_award_invalid_type";
    // 兑换
    ErrorCode[ErrorCode["exchange_faild"] = 10200] = "exchange_faild";
    // 游戏结算
    ErrorCode[ErrorCode["game_result_fail"] = 20000] = "game_result_fail";
    ErrorCode[ErrorCode["game_start_fail"] = 20001] = "game_start_fail";
    ErrorCode[ErrorCode["level_reward_fail"] = 20002] = "level_reward_fail";
    ErrorCode[ErrorCode["game_result_validate_fail"] = 20003] = "game_result_validate_fail";
    ErrorCode[ErrorCode["game_result_level_data_validate_fail"] = 20004] = "game_result_level_data_validate_fail";
    ErrorCode[ErrorCode["game_result_checkpoint_data_validate_fail"] = 20005] = "game_result_checkpoint_data_validate_fail";
    ErrorCode[ErrorCode["game_result_block_data_validate_fail"] = 20006] = "game_result_block_data_validate_fail";
    ErrorCode[ErrorCode["game_start_not_enough_items"] = 20007] = "game_start_not_enough_items";
    ErrorCode[ErrorCode["game_start_use_items_fail"] = 20008] = "game_start_use_items_fail";
    ErrorCode[ErrorCode["gm_tool_execute_error"] = 20200] = "gm_tool_execute_error";
    ErrorCode[ErrorCode["team_create_fail"] = 30000] = "team_create_fail";
    ErrorCode[ErrorCode["team_not_exist"] = 30001] = "team_not_exist";
    ErrorCode[ErrorCode["team_member_not_exist"] = 30002] = "team_member_not_exist";
    ErrorCode[ErrorCode["team_join_fail"] = 30003] = "team_join_fail";
    ErrorCode[ErrorCode["team_reward_fail"] = 30004] = "team_reward_fail";
    ErrorCode[ErrorCode["team_kick_fail"] = 30005] = "team_kick_fail";
    ErrorCode[ErrorCode["game_use_pro_fail"] = 30010] = "game_use_pro_fail";
    ErrorCode[ErrorCode["rank_list_error"] = 30020] = "rank_list_error";
    ErrorCode[ErrorCode["rank_update_error"] = 30021] = "rank_update_error";
    ErrorCode[ErrorCode["mail_get_reward_fial"] = 30030] = "mail_get_reward_fial";
    ErrorCode[ErrorCode["activity_reward_fail"] = 30040] = "activity_reward_fail";
    ErrorCode[ErrorCode["add_prop_fial"] = 30041] = "add_prop_fial";
    ErrorCode[ErrorCode["resurrection_fail"] = 30042] = "resurrection_fail";
    // 消息订阅
    ErrorCode[ErrorCode["subscribe_create_msgdata_fail"] = 30100] = "subscribe_create_msgdata_fail";
    ErrorCode[ErrorCode["subscribe_repeat_msg_fail"] = 30101] = "subscribe_repeat_msg_fail";
    ErrorCode[ErrorCode["subscribe_no_role_fail"] = 30102] = "subscribe_no_role_fail";
    ErrorCode[ErrorCode["subscribe_access_token_fail"] = 30102] = "subscribe_access_token_fail";
    // 购买相关
    ErrorCode[ErrorCode["buy_table_res_fail"] = 30200] = "buy_table_res_fail";
    ErrorCode[ErrorCode["buy_not_enough_money"] = 30201] = "buy_not_enough_money";
    // 成就相关
    ErrorCode[ErrorCode["achievement_table_res_fail"] = 30300] = "achievement_table_res_fail";
    ErrorCode[ErrorCode["achievement_invalid_stage"] = 30301] = "achievement_invalid_stage";
    ErrorCode[ErrorCode["achievement_invalid_data"] = 30302] = "achievement_invalid_data";
    ErrorCode[ErrorCode["achievement_repeat_award"] = 30303] = "achievement_repeat_award";
    ErrorCode[ErrorCode["achievement_not_complete"] = 30304] = "achievement_not_complete";
    // 签到相关
    ErrorCode[ErrorCode["signin_record_not_exist"] = 30400] = "signin_record_not_exist";
    ErrorCode[ErrorCode["signin_already_complete"] = 30401] = "signin_already_complete";
    ErrorCode[ErrorCode["signin_invalid_res"] = 30402] = "signin_invalid_res";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
//# sourceMappingURL=defines.js.map