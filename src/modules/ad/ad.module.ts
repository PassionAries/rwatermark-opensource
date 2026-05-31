import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WechatMiniApiModule } from 'src/modules/wechat-mini-api';
import { MiniUserEntity } from 'src/entities/miniUser.entity';
import { PlayVideoAdEntity } from 'src/entities/playVideoAd.entity';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdService } from './ad.service';
import { AdController } from './ad.controller';
import { MiniUserModule } from '../mini-user/mini-user.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      MiniUserEntity,
      PlayVideoAdEntity
    ]),
    WechatMiniApiModule,
    MiniUserModule,
  ],
  controllers: [AdController],
  providers: [AdService],
})
export class AdModule {}
