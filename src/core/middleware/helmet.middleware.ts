import { Injectable, NestMiddleware } from '@nestjs/common';
import helmet from 'helmet';

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
    private helmet: any;

    constructor(
    ) {
        this.helmet = helmet({
            contentSecurityPolicy:false,
        });
    }

    use(request: Request, response: Response, next: () => void) {
        const req: any = request;
        const res: any = response;

        this.helmet(req, res, next);
    }
}