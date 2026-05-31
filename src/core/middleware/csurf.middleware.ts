import * as url from 'url';
import * as csurf from 'csurf';
import { Injectable, NestMiddleware } from '@nestjs/common';

const csrfProtection = csurf({
    cookie: true,
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS','PATCH',"DELETE","POST"],
});

@Injectable()
export class CSURFMiddleware implements NestMiddleware {
    constructor(
    ) {}

    use(request: Request, response: Response, next: () => void) {
        const req: any = request;
        const res: any = response;

        const pathname:any = url.parse(req.originalUrl).pathname;
        const trustArr = [
            '/api',
        ];
        console.log("pathname",trustArr.indexOf(pathname),pathname);
        if (trustArr.indexOf(pathname) >= 0) {
            next();
            return;
        }
        csrfProtection(req, res, next);
    }
}