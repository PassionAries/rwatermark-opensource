import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import {Request,Response} from 'express';
import { EncryptionService } from '../services/encryption.service';

@Injectable()
export class TransfromResponseInterceptor implements NestInterceptor {
  constructor(private readonly encryptionService: EncryptionService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if(context.getType()!=='http'){
      return next.handle();
    }
    return next.handle().pipe(map((data) => {
      // console.log("context.getType()",context.getType());
      if(context.getType()=='http'){
        const response = context.switchToHttp().getResponse() as Response;
        const req = context.switchToHttp().getRequest() as Request;
        // return data;
        if(response.statusCode==201){
            response.status(200)
        }
         // 如果数据已经是字符串格式的加密数据，直接返回
          if (typeof data === 'string' && data.includes(':')) {
            return data;
          }
        // 方式2: 通过路径判断（例如所有 /api 开头的接口都加密）
        if (!req.originalUrl.startsWith('/api')) {
          return data;
        }
        // /download
        if(req.originalUrl.includes('/download')){
          return data;
        }
       // 加密响应数据
        try {
          const encryptedData = this.encryptionService.encryptObject(data.data);
          
          // 设置响应头标识数据已加密
          data.data = encryptedData;
          return data
        } catch (error) {
          // 加密失败时返回原始数据
          console.error('响应加密失败:', error);
          return data;
        }
        if(!req.originalUrl.startsWith("/api")){
          return data;
        }
        // console.log("req",req.headers.accept,response.getHeaders())
        // data
        return {
          code: 200,
          data
        }
      }else{
         return data;
      }
    }));
  }
}