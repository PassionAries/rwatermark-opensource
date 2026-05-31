import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
// CommonJS 模块直接 module.exports = API，无 default，用 import 更符合项目 module: nodenext
import WechatMiniAPI from './api/index.js';
import { ConfigService } from 'src/config';

@Injectable()
export class WechatMiniApiService implements OnModuleInit {
    private wechatMiniApi: any;
    private wechatMiniApiMap:Record<string,any> = {};
    private token: {accessToken:string,expireTime:number} | null = null;
    private tokenMap:Record<string,{accessToken:string,expireTime:number}> = {};
    constructor(private configService: ConfigService) {}
    async onModuleInit() {
        let wechatMiniMap = this.configService.get('wechatMiniMap');
        for(let appid in wechatMiniMap){
            this.wechatMiniApiMap[appid] = new WechatMiniAPI(
                wechatMiniMap[appid].appId,
                wechatMiniMap[appid].appSecret,
                ()=>{
                    return this.getToken(appid)
                },
                (token)=>{
                    return this.saveToken(appid,token)
                }
            );
        }
        //  this.wechatMiniApi = new WechatMiniAPI.default(
        //     this.configService.get('wechatMini.appId'),
        //     this.configService.get('wechatMini.appSecret')
        // ,this.getToken,this.saveToken)
    }
    async getToken(appid) {
        // return this.wechatMiniApi.getToken();
        return this.tokenMap[appid];
        // return this.token;
    }   
    async saveToken(appid,token:{accessToken:string,expireTime:number}) {
        // console.log("saveToken",token);
        this.tokenMap[appid] = token;
        return this.tokenMap[appid];
        // return this.wechatMiniApi.saveToken(token);
    }
    async code2Session(appid: string, code: string): Promise<{openid:string,session_key:string,unionid:string|""|null}> {
        if(!this.wechatMiniApiMap[appid]){
            throw new BadRequestException('appid not found');
        }
        return this.wechatMiniApiMap[appid].code2Session(code);
    }

}
