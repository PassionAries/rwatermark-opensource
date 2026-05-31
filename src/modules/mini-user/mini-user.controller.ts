import { Body, Controller, Post, Get, Put, Delete, Param, Query, Patch, UseGuards, Req } from '@nestjs/common';
import { ResUtils } from 'src/utils/res.utils';
import moment from 'moment';
import { CheckLoginUserGatewayGuard } from 'src/core/guards/check-login-user-gateway.guards';
import { MiniUserService } from './mini-user.service';
import { SpLoginDto, FindPointsDetailListDto } from './dto/mini-user.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

@ApiTags('mini-user')
@Controller('/api/mini-user')
export class MiniUserController {
  constructor(private readonly miniUserService: MiniUserService) {}

  @Post("spLogin")
  async spLogin(@Body() body:SpLoginDto,@Req() req) {
    let res = await this.miniUserService.spLogin(body);
    return ResUtils.success({
      data:res,
    })
  }
  @Post("checkLogin")
  @UseGuards(CheckLoginUserGatewayGuard("user"))
  async checkLogin(@Req() req, @Body() body: any) {
    let loginUser = req.loginUser;
    // console.log("loginUser",loginUser);
    console.log("body",body);
    const inviteCode = await this.miniUserService.getMyInviteCode(loginUser);
    loginUser.inviteCode = inviteCode;
    return ResUtils.success({
      data:loginUser,
    });
  }

  @Post("updateUserInfo")
  @UseGuards(CheckLoginUserGatewayGuard("user"))
  async updateUserInfo(@Req() req, @Body() body: any) {
    let loginUser = req.loginUser;
    let user = await this.miniUserService.updateUserInfo(loginUser.id, body);
    return ResUtils.success({
      data:user,
    });
  }

}

