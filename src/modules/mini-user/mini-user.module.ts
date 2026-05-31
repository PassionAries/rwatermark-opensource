import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiniUserController } from './mini-user.controller';
import { MiniUserService } from './mini-user.service';
import { WechatMiniApiModule } from 'src/modules/wechat-mini-api';
import { MiniUserEntity } from 'src/entities/miniUser.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      MiniUserEntity,
    ]),
    WechatMiniApiModule,
  ],
  controllers: [MiniUserController],
  providers: [MiniUserService],
  exports: [MiniUserService],
})
export class MiniUserModule {}
