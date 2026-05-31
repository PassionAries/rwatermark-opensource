import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AdService } from "./ad.service";
import { ApiTags } from "@nestjs/swagger";
import { ResUtils } from "src/utils/res.utils";
import { CheckLoginUserGatewayGuard } from "src/core/guards/check-login-user-gateway.guards";


@ApiTags('ad')
@Controller('/api/ad')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Post("getAdConfig")
  @UseGuards(CheckLoginUserGatewayGuard("user"))
  async getAdConfig(@Body() body,@Req() req){
    body.appid = req.loginUser.appid;
    body.openid = req.loginUser.openid;
    let adConfig = await this.adService.getAdConfig(body);
    if(adConfig){
        return ResUtils.success({
          data:{
            playvideo:adConfig.count < 1,
          },
        });
    }else{
        return ResUtils.success({
          data:{
            playvideo:true,
          },
        });
    }
  }
  @Post("playAd")
  @UseGuards(CheckLoginUserGatewayGuard("user"))
  async playAd(@Body() body:any,@Req() req){
    body.appid = req.loginUser.appid;
    body.openid = req.loginUser.openid;
     let canplay = await this.adService.playAd(body);
     return ResUtils.success({
      data:canplay,
     });
  }

  @Post("playAdAndGetPoints")
  @UseGuards(CheckLoginUserGatewayGuard("user"))
  async playAdAndGetPoints(@Body() body:any,@Req() req){
    body.appid = req.loginUser.appid;
    body.openid = req.loginUser.openid;
    let points = await this.adService.playAdAndGetPoints(body);
    return ResUtils.success({
      data:points,
    });
  }
  @Post("getPlayVideoAdCount")
  @UseGuards(CheckLoginUserGatewayGuard("user"))
  async getPlayVideoAdCount(@Body() body:any,@Req() req){
    body.appid = req.loginUser.appid;
    body.openid = req.loginUser.openid;
    let count = await this.adService.getPlayVideoAdCount(body.openid,body.appid);
    return ResUtils.success({
      data:count,
    });
  }
}   