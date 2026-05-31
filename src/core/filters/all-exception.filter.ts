import { ArgumentsHost, Catch, ExceptionFilter, HttpException, 
  HttpStatus, Logger,BadRequestException,InternalServerErrorException,
  NotFoundException, 
  ForbiddenException
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionFilter<T extends Error> implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);
  catch(exception: T, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest() as Request;
    const response = host.switchToHttp().getResponse() as Response;
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? (<any>exception.getResponse()).message : exception.message;
    // if(exception instanceof BadRequestException){ //数据校验。
    // }
    if(exception instanceof NotFoundException){
        // 401,403,404
        //记录请求的url，和method 和ip
        // console.log("NotFoundException",request.url,request.method,(request  as any).clientIp);
        console.error(`NotFoundException: ${request.url} ${request.method} ${(request  as any).clientIp}`);
        // console.log("NotFoundException",HttpStatus.UNAUTHORIZED);
        return response.status(status).json({
          code: status,
          msg:message,
          timestamp: new Date().toISOString(),
          path: request.url
        })
    }
    if(exception instanceof ForbiddenException){
      // 401,403,404
      // console.log("NotFoundException",HttpStatus.UNAUTHORIZED);
       return response.status(status).json({
        code: status,
        msg:message,
        timestamp: new Date().toISOString(),
        path: request.url
      })
    }
    if(exception instanceof BadRequestException){ //数据校验。
      console.log("BadRequestException:message",message);
      return response.status(status).json({
        code: status,
        msg:Array.isArray(message)?message[0]:message,
        timestamp: new Date().toISOString(),
        path: request.url
      })  
    }
      if(exception instanceof InternalServerErrorException){ //数据校验。
        this.logger.error(exception);
      }else{
        console.error(exception);
      }

    response.status(status).json({
      code: status,
      msg:message,
      timestamp: new Date().toISOString(),
      path: request.url
    })
  }
}