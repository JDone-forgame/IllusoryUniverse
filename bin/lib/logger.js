"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMoudle = void 0;
const mx_tool_1 = require("mx-tool");
const mx_logger_1 = require("mx-logger");
class Logger extends mx_logger_1.LoggerMoudle {
    constructor() {
        super();
        this.name = "Logger";
    }
    createlog(arrayList = [], outParam = {}) {
        // 有几个是必须要有的添加一下
        let needslist = ['record_time'];
        for (let i = 0; i < needslist.length; i++) {
            if (arrayList.indexOf(needslist[i]) < 0) {
                arrayList.push(needslist[i]);
            }
        }
        // 生成日志的通用接口
        let outLog = {};
        let extList = [];
        for (let key in arrayList) {
            let sKey = arrayList[key];
            switch (sKey) {
                case 'platId':
                    outLog[sKey] = mx_tool_1.ConfigMgr.get('id') || '';
                    break;
                case 'record_time':
                    outLog[sKey] = mx_tool_1.LocalDate.formateString();
                    break;
                default:
                    if (outParam.hasOwnProperty(sKey)) {
                        outLog[sKey] = outParam[sKey];
                    }
                    else {
                        extList.push(sKey);
                    }
                    break;
            }
        }
        return outLog;
    }
    /**
     * 角色注册日志
     */
    roleRegist(gameId, playerName, pwd) {
        let outList = [
            'sGameId',
            'sPlayerName',
            'sPwd'
        ];
        let outParam = {
            'sGameId': (gameId || "").toString(),
            "sPlayerName": (playerName || "").toString(),
            'sPwd': (pwd || "").toString()
        };
        this.logEvent(gameId, 'roleRegist', this.createlog(outList, outParam));
    }
}
exports.LoggerMoudle = new Logger();
//# sourceMappingURL=logger.js.map