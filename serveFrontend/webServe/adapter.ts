// 对称加密
import { WebRouteModule, Response, Request } from "mx-webserve";
import { RequestEx } from "mx-webserve/src/webHandle";
import { LoggerMoudle } from "../../lib/logger";


interface RequestExE extends RequestEx {
    reqID?: string
}

@WebRouteModule.envClass("HJ")
class normal {
    @WebRouteModule.envBefore()
    async before(req: RequestExE, res: Response) {
        let uid: any = req.params.gameId;
        if (!uid) {
            let info: any = req.params.info;
            if (info && info["userId"])  {
                uid = info["userId"];
            }
        }
        req.reqID = LoggerMoudle.apiBegin(req.path, req.method, uid, req.params)
    }
    @WebRouteModule.envAfter()
    after(req: RequestExE, res: Response) {
        if (req.reqID) LoggerMoudle.apiEnd(req.reqID, true, req.responseData)
    }
}