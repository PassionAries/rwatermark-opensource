import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
    constructor(
        private configService:ConfigService,
    ) {}

    use(request: Request, response: Response, next: () => void) {
        const req: any = request;
        const res: any = response;

        if (this.configService.get("cors").allowOrigins.indexOf(req.headers.origin) >= 0) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
        }
        res.header('Access-Control-Allow-Methods', 'OPTIONS,HEAD,PUT,POST,GET,DELETE');
        next();
    }
}