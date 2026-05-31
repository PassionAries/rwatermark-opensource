import { Test, TestingModule } from '@nestjs/testing';
import { WechatMiniApiService } from './wechat-mini-api.service';

describe('WechatMiniApiService', () => {
  let service: WechatMiniApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WechatMiniApiService],
    }).compile();

    service = module.get<WechatMiniApiService>(WechatMiniApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
