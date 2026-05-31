import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "src/config";
import { PlayVideoAdEntity } from "src/entities/playVideoAd.entity";
import moment from "moment";
import { Repository } from "typeorm";
import { MiniUserService } from "../mini-user/mini-user.service";

@Injectable()
export class AdService {
      constructor(
        @InjectRepository(PlayVideoAdEntity)
        private playVideoAdRepository: Repository<PlayVideoAdEntity>,
        private configService: ConfigService,
        private miniUserService: MiniUserService,
      ){

      }
      async getAdConfig(body:any){
         let date = moment().format('YYYY-MM-DD');
        let playVideoAd = await this.playVideoAdRepository.findOne({
            where: {
                appid: body.appid,
                openid: body.openid,
                date: date,
            }
        });
        return playVideoAd;
      }
      async getAdConfigRow(openid:string,appid:string){
        let date = moment().format('YYYY-MM-DD');
        let playVideoAd = await this.playVideoAdRepository.findOne({
            where: {
                openid: openid,
                appid: appid,
                date: date,
            }
        });
        return playVideoAd;
      }
      async getPlayVideoAdCount(openid:string,appid:string):Promise<number>{
        let date = moment().format('YYYY-MM-DD');
        let playVideoAd = await this.playVideoAdRepository.findOne({
            where: {
                openid: openid,
                appid: appid,
                date: date,
            }
        });
        return playVideoAd?.count||0;
      }
      async playAdAndGetPoints(body:any){
        let date = moment().format('YYYY-MM-DD');
        let playVideoAd = await this.playVideoAdRepository.findOne({
            where: {
                openid: body.openid,
                appid: body.appid,
                date: moment().format('YYYY-MM-DD'),
            }
        });
         if(playVideoAd){
            playVideoAd.count++;
            await this.playVideoAdRepository.save(playVideoAd);
            if(playVideoAd.count > 5){
                return false;
            }
        }else{
            playVideoAd = new PlayVideoAdEntity();
            playVideoAd.openid = body.openid;
            playVideoAd.date = date;
            playVideoAd.count = 1;
            playVideoAd.appid = body.appid;
            await this.playVideoAdRepository.save(playVideoAd);
        }
        let count = await this.getPlayVideoAdCount(body.openid,body.appid);
        if(count > 5){
            return playVideoAd;
        }
        // 获取积分
        return playVideoAd
      }
      async playAd(body:any){
        let date = moment().format('YYYY-MM-DD');
        let playVideoAd = await this.playVideoAdRepository.findOne({
            where: {
                openid: body.openid,
                appid: body.appid,
                date: date,
            }
        });        
        if(playVideoAd){
            playVideoAd.count++;
            await this.playVideoAdRepository.save(playVideoAd);
            if(playVideoAd.count > 5){
                return false;
            }
        }else{
            playVideoAd = new PlayVideoAdEntity();
            playVideoAd.openid = body.openid;
            playVideoAd.date = date;
            playVideoAd.count = 1;
            playVideoAd.appid = body.appid;
            await this.playVideoAdRepository.save(playVideoAd);
        }
        return false;
      }
}