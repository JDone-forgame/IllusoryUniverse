/**
 * this is a auto create file
 * 这是一个自动生成的文件,最好不要直接改动这个文件
 */

import { ErrorCode } from "../defines/defines"
import { RequestRPC } from "./nodesocket"



class localgameRPC extends RequestRPC {
    /**
	 * 
登陆游戏
	 * @param {string} gameId 玩家id
	 * @param {string} playerName 玩家昵称
	 * @param {string} pwd 玩家密码
	 */
	login(gameId: string, playerName: string, pwd: string):Promise<{code: ErrorCode}> {
	    let query = {
			gameId: gameId,
			playerName: playerName,
			pwd: pwd
	    }
	
	    let body = {
	
	    }
	
	    return this.request<any>("request", "login", Object.assign(query, body),"gameId,playerName,pwd".split(","),"gameId")
	}
	/**
	 * 
从内存中移除角色数据
	 * @param {string} gameId 玩家id
	 */
	bcRemoveRole(gameId: string):Promise<{code: ErrorCode}> {
	    let query = {
			gameId: gameId
	    }
	
	    let body = {
	
	    }
	
	    return this.request<any>("broadcast", "bcRemoveRole", Object.assign(query, body),"gameId".split(","),"gameId")
	}
	/**
	 * 
gm指令
	 * @param {string} gameId 玩家id
	 * @param {string} token token
	 * @param {string} cmd 参数
	 */
	gmCommand(gameId: string, token: string, cmd: string):Promise<{code: number}> {
	    let query = {
			gameId: gameId,
			token: token,
			cmd: cmd
	    }
	
	    let body = {
	
	    }
	
	    return this.request<any>("request", "gmCommand", Object.assign(query, body),"gameId,token,cmd".split(","),"gameId")
	}
	/**
	 * 
读取玩家信息
	 * @param {string} gameId 玩家id
	 * @param {string} token token
	 */
	loadPlayerInfo(gameId: string, token: string):Promise<{code: number}> {
	    let query = {
			gameId: gameId,
			token: token
	    }
	
	    let body = {
	
	    }
	
	    return this.request<any>("request", "loadPlayerInfo", Object.assign(query, body),"gameId,token".split(","),"gameId")
	}
}

export class gameRPC {
    private static _inst: localgameRPC
    static async rpc_init(srv?:any) {
        if (!this._inst) this._inst = new localgameRPC("game", srv)
        return true;
    }

    static get inst() {
        if (!this._inst)  throw("need call rpc_init first game")
        return this._inst;
    }
}