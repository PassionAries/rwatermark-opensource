import { BadRequestException, ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import * as jwt  from 'jsonwebtoken';
import moment from 'moment';
import { ConfigService } from 'src/config';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SpLoginDto, FindPointsDetailListDto } from './dto/mini-user.dto';
import { WechatMiniApiService } from 'src/modules/wechat-mini-api';
import { MiniUserEntity } from 'src/entities/miniUser.entity';

@Injectable()
export class MiniUserService {
      constructor(
        private configService: ConfigService,
        private wechatMiniApiService: WechatMiniApiService,
        @InjectRepository(MiniUserEntity)
        private miniUserRepository: Repository<MiniUserEntity>,
    ) {}

    /** 生成唯一邀请码（8 位字母数字） */
    private async generateInviteCode(): Promise<string> {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        for (let i = 0; i < 20; i++) { // 循环10次判断 是否有重复。
            let code = '';
            for (let j = 0; j < 8; j++) code += chars[Math.floor(Math.random() * chars.length)];
            const exists = await this.miniUserRepository.findOne({ where: { inviteCode: code } });
            if (!exists) return code;
        }
        return 'I' + Date.now().toString(36);
    }

    /** 确保用户有邀请码：没有则生成并保存，返回邀请码 */
    async ensureInviteCode(user: MiniUserEntity): Promise<string> {
        const u = await this.miniUserRepository.findOne({ where: { id: user.id } });
        if (!u) return '';
        if (u.inviteCode) return u.inviteCode;
        const code = await this.generateInviteCode();
        u.inviteCode = code;
        await this.miniUserRepository.save(u);
        return code;
    }

    /** 获取默认小程序 appid：优先读配置，否则在仅配置一个小程序时自动使用 */
    private resolveDefaultAppid(): string {
        const defaultAppid = this.configService.get<string>('defaultAppid');
        if (defaultAppid) {
            return defaultAppid;
        }
        const wechatMiniMap = this.configService.get<Record<string, { appId?: string }>>('wechatMiniMap', {});
        const keys = Object.keys(wechatMiniMap);
        if (keys.length === 1) {
            return wechatMiniMap[keys[0]]?.appId || keys[0];
        }
        throw new BadRequestException('appid is required');
    }

    async spLogin(body: SpLoginDto): Promise<{ token: string; miniUser: MiniUserEntity }> {
        body.appid = body.appid || this.resolveDefaultAppid();
        const code2Session = await this.wechatMiniApiService.code2Session(body.appid, body.code);
        let miniUser = await this.miniUserRepository.findOne({ where: { openid: code2Session.openid, appid: body.appid } });
        if (!miniUser) {
            miniUser = new MiniUserEntity();
            miniUser.openid = code2Session.openid;
            miniUser.sessionKey = code2Session.session_key;
            miniUser.unionid = code2Session.unionid || '';
            miniUser.lastLoginAt = new Date();
            miniUser.appid = body.appid;
            miniUser.viewCount = 1;
            const pointsPerDay = this.configService.get<number>('checkIn.pointsPerDay', 10);
            miniUser.balance = pointsPerDay;
            miniUser = await this.miniUserRepository.save(miniUser);
            
            await this.ensureInviteCode(miniUser);
            
        } else {
            miniUser.lastLoginAt = new Date();
            miniUser.viewCount++;
            miniUser = await this.miniUserRepository.save(miniUser);
        }
        let token = jwt.sign({
          openid:miniUser.openid,
          appid:miniUser.appid
        },this.configService.get("jwt.secret"),{ expiresIn: "2d" });

        return {
          token:token,
          miniUser:miniUser,
        };
    }

    /** 获取当前用户邀请码（没有则生成，老用户首次请求时生成） */
    async getMyInviteCode(user: MiniUserEntity): Promise<string> {
      const code = await this.ensureInviteCode(user);
      return code
    }
    async updateUserInfo(userId: number, body: any): Promise<MiniUserEntity> {
      let user = await this.miniUserRepository.findOne({ where: { id: userId } });
      if(!user) throw new ForbiddenException('用户不存在');

      user.nickname = body.nickname;
      user.avatar = body.avatar;
      // user.avatar = body.avatar;
      // user.gender = body.gender;
      user = await this.miniUserRepository.save(user);
      return user;
    }
}



