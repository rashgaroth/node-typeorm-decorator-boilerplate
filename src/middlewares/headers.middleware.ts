import { NextFunction, Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

@Middleware({ type: 'before' })
export class HeaderMiddleware implements ExpressMiddlewareInterface {
  use(req: Request, res: Response, next: NextFunction): void {
    const origin = req.get('origin');

    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Methods',
      'GET,POST,HEAD,OPTIONS,PUT,PATCH,DELETE'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Access-Control-Request-Method, Access-Control-Allow-Headers, Access-Control-Request-Headers'
    );

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
    } else {
      next();
    }
  }
}
