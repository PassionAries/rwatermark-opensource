import * as requestIp from 'request-ip';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class IpMiddleware implements NestMiddleware {
    constructor(
    ) {}

    use(request: Request, response: Response, next: () => void) {
        const req: any = request as any;
        const clientIp = requestIp.getClientIp(request as any);
        (request as any).clientIp = clientIp;
        req.clientIp=clientIp;
        next();
    }
}