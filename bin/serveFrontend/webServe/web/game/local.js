"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const crypto_1 = require("crypto");
const mx_tool_1 = require("mx-tool");
const mx_webserve_1 = require("mx-webserve");
const defines_1 = require("../../../../defines/defines");
const gameRPC_1 = require("../../../../rpcs/gameRPC");
let _ = class _ {
    /**
     * 登录接口
     * @date 2020-10-10
     * @group login - 登录相关
     * @route POST /game/local/login
     * @param {string} name.query.required - 游戏名称
     * @param {string} pwd.query.required - 登录密码
     * @returns {{code:number}} 0 - 返回内容
     */
    login(param) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = {
                code: 0,
                gameId: crypto_1.createHash('md5').update(param.name).digest('hex'),
                playerName: param.name,
                pwd: param.pwd
            };
            return gameRPC_1.gameRPC.inst
                .login(data.gameId, data.playerName, data.pwd);
        });
    }
    /**
     * 执行gm指令
     * @date 2020-10-10
     * @route POST /game/local/gmcommand
     * @group game - 活动管理器
     * @param {string} gameId.query.required - 玩家id
     * @param {string} token.query.required - token
     * @param {string} cmd.query.required - cmd
     * @returns {{ code: number}} 0 - 操作结果
     */
    gmcommand(param) {
        if (mx_tool_1.ConfigMgr.get("gm", false)) {
            return gameRPC_1.gameRPC.inst.gmCommand(param.gameId, param.token, param.cmd);
        }
        else {
            throw ({ code: defines_1.ErrorCode.param_error, errMsg: `GM指令仅仅支持在开发中使用!` });
        }
    }
};
__decorate([
    mx_webserve_1.WebRouteModule.route(),
    mx_webserve_1.WebRouteModule.paramRequired("name", "string", true),
    mx_webserve_1.WebRouteModule.paramRequired("pwd", "string", true)
], _.prototype, "login", null);
__decorate([
    mx_webserve_1.WebRouteModule.paramRequired("gameId", "string", true),
    mx_webserve_1.WebRouteModule.paramRequired("token", "string", true),
    mx_webserve_1.WebRouteModule.paramRequired("cmd", "string", true),
    mx_webserve_1.WebRouteModule.route()
], _.prototype, "gmcommand", null);
_ = __decorate([
    mx_webserve_1.WebRouteModule.class(module)
], _);
//# sourceMappingURL=local.js.map