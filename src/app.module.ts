import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RWatermarkModule } from './modules/rwatermark/index.module';
import { SlowSqlEntity } from './entities/slowSql.entity';
import { MiniUserEntity } from './entities/miniUser.entity';
import { ConfigModule, ConfigService } from './config';
import { ShortVideoEntity } from './entities/shortVideo.entity';
import { TypeOrmLogger } from './TypeOrmLogger';
import { ScheduleModule } from '@nestjs/schedule';
import { EncryptionService } from './core/services/encryption.service';
import { WechatMiniApiModule } from './modules/wechat-mini-api';
import { AdModule } from './modules/ad/ad.module';
import { MiniUserModule } from './modules/mini-user/mini-user.module';

@Module({
  imports: [
    ConfigModule.load('conf-json/rwatermark-server.json',{}),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService,typeOrmLogger:TypeOrmLogger) =>  {
        const logger = new TypeOrmLogger();
        console.log("configService.typeorm",configService.get('typeorm'));
        return {
            type: 'mysql',
            host: configService.get('typeorm.host'),
            port: configService.get('typeorm.port'),
            username: configService.get('typeorm.username'),
            password: configService.get('typeorm.password'),
            database: configService.get('typeorm.database'),
            // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            entities: [
              MiniUserEntity,
              SlowSqlEntity,
              ShortVideoEntity
            ],
            synchronize: false,
            logging: false, // 启用日志
            // logger: logger, // 使用自定义 logger
            maxQueryExecutionTime: 1000, // 慢查询阈值（毫秒）
          }
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([SlowSqlEntity]), // 注册 SlowSql 实体
    RWatermarkModule,
    MiniUserModule,
    AdModule,
    WechatMiniApiModule,

  ],
  controllers: [AppController],
  providers: [AppService, EncryptionService],
})
export class AppModule {}
