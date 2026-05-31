import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';


@Injectable()
export class CookieParserMiddleware implements NestMiddleware {
    private cookieParser: any;

    constructor(
        private configService:ConfigService
    ) {
        this.cookieParser = cookieParser(this.configService.get<string>('cookieSecret'));
    }

    use(request: Request, response: Response, next: () => void) {
        const req: any = request;
        const res: any = response;

        this.cookieParser(req, res, next);
    }
}