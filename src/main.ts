import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config()
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from 'src/core/filters/all-exception.filter';
import { LoggingInterceptor } from 'src/core/interceptors/logging.interceptor';
import { TransfromResponseInterceptor } from 'src/core/interceptors/transform-response.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from 'src/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { EncryptionService } from 'src/core/services/encryption.service';

async function bootstrap() {
   const app = await NestFactory.create<NestExpressApplication>(AppModule,{});
  let configService =app.get(ConfigService) 
  
  // await initWordService.initWord();
  // await initPinyinService.initPinyinTone();
  const encryptionService = app.get(EncryptionService);
  app.useGlobalInterceptors(new LoggingInterceptor(),
      new TransfromResponseInterceptor(encryptionService)
  );
  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors()
  app.enableShutdownHooks();
  // app.startAllMicroservices
    const config = new DocumentBuilder()
    .setTitle('rwatermark-server')
    .setDescription('rwatermark-server API description')
    .setVersion('1.0')
    .addTag('rwatermark-server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'token',
        description: 'Enter JWT token',
        in: 'header',
      },
      'Bearer', // 这是认证方案的名称
    )
    .build();
    if(configService.get('env') === 'dev'){
      const documentFactory = () => SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('/api', app, documentFactory);
    }

  // 使用绝对路径配置静态资源，避免Linux环境下的路径解析问题
  const staticAssetsPath = join(__dirname, '../../../public/', configService.get('serviceName'));
  app.useStaticAssets(staticAssetsPath);
  
  await app.listen(configService.get('port'));
  console.log(`${configService.get('serviceName')} is running on port ${configService.get('port')}`);
  console.log(`Static assets served from: ${staticAssetsPath}`);
}
bootstrap();

