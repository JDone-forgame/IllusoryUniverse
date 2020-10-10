"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
const mx_rpc_1 = require("mx-rpc");
const mx_tool_1 = require("mx-tool");
const mx_webserve_1 = require("mx-webserve");
const path_1 = require("path");
exports.name = "webServe";
let web = class web {
    init() {
        // 是否开启swagger
        if (mx_tool_1.ConfigMgr.get("host") && mx_tool_1.ConfigMgr.get("Swagger")) {
            try {
                mx_webserve_1.WebRouteModule.openSwagger({ basedir: path_1.join(__dirname, '..'), ext: ".js", routePath: "web", title: "幻界", host: mx_tool_1.ConfigMgr.get("host") });
            }
            catch (e) {
            }
        }
        require("../adapter");
        mx_webserve_1.WebRouteModule.openCross();
        return mx_webserve_1.WebRouteModule.init(mx_tool_1.ConfigMgr.get("web"), path_1.join(__dirname, '..', 'web'), function () {
            return mx_tool_1.ConfigMgr.get("channel") || "";
        });
    }
};
__decorate([
    mx_rpc_1.RPCHandle.init()
], web.prototype, "init", null);
web = __decorate([
    mx_rpc_1.RPCHandle.class("webServe", module)
], web);
//# sourceMappingURL=index.js.map