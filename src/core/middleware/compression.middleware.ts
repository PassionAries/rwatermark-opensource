import { Injectable, NestMiddleware } from '@nestjs/common';
import * as compression from 'compression';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
    private compression: any;

    constructor(
    ) {
        this.compression = compression();
    }

    use(request: Request, response: Response, next: () => void) {
        const req: any = request;
        const res: any = response;

        this.compression(req, res, next);
    }
}