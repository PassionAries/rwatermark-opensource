import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, ForbiddenException, Inject, mixin, Type, UnauthorizedException, BadRequestException } from '@nestjs/common';
// import { User, UserStatus } from '../../entity/user.entity';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ConfigService } from 'src/config';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MiniUserEntity } from 'src/entities/miniUser.entity';

export const  CheckLoginUserGatewayGuard=(role:"admin"|"user"):Type=>{
    class  CheckLoginUserGatewayGuardMixin implements CanActivate {
        @Inject()
        private configService:ConfigService;
        @InjectRepository(MiniUserEntity)
        private readonly userMiniRepository: Repository<MiniUserEntity>
        constructor(
        ){}
    
        async canActivate(context: ExecutionContext): Promise<boolean> {
            const req:any = context.switchToHttp().getRequest();
            let token=req.headers['token'];
            // console.log("headers--token",token,req.headers);
            if(!token) throw new ForbiddenException("Please login")
            let data:any = null;
            try{
                data = await jwt.verify(token,this.configService.get("jwt.secret"));
            }catch(err){
                //令牌无效或过期
                throw new ForbiddenException("Token invalid or expired");// 403 状态码
            }
            let appid = req.headers['appid'] || data.appid;
            if (!appid) throw new ForbiddenException('appid is required');
            // console.log('data-----guards',data)
            if(data?.openid){
                const user = await this.userMiniRepository.findOne({
                    where: {
                        openid: data.openid,
                        appid:appid,
                    }
                });
                if(!user) throw new ForbiddenException("Account does not exist")// 401 状态码
                
                req.loginUser =user;
                // console.log('99999=====>>')
            }else{
                throw new ForbiddenException("Please log out and log in again") // 400 状态码
            }
            return true;
        }
    }
    const guard = mixin(CheckLoginUserGatewayGuardMixin);
    return guard;
}
