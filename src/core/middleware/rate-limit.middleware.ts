import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as rateLimit from 'express-rate-limit';
let rateLimit =require("express-rate-limit")

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
    private rateLimit: any;

    constructor(
        private configService:ConfigService,
    ) {
        this.rateLimit = rateLimit(this.configService.get('rateLimit')||{});
    }

    use(request: Request, response: Response, next: () => void) {
        const req: any = request;
        const res: any = response;

        this.rateLimit(req, res, next);
    }
}