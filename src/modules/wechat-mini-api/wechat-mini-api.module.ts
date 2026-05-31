import { Module } from '@nestjs/common';
import { WechatMiniApiService } from './wechat-mini-api.service';

@Module({
  providers: [WechatMiniApiService],
  exports: [WechatMiniApiService],
})
export class WechatMiniApiModule {}
