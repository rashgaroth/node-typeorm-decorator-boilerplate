/* eslint-disable no-console */
import { Request, Response } from 'express';
import {
  ExpressErrorMiddlewareInterface,
  HttpError,
  Middleware,
  NotFoundError,
} from 'routing-controllers';

import logger from '@/configs/logger.config';

type IError = {
  httpCode: number;
  name: string;
  message: string;
};

@Middleware({ type: 'after' })
export class ServerError implements ExpressErrorMiddlewareInterface {
  error(error: IError | any, req: Request, res: Response) {
    logger.error(error);
    console.error(`Error ::`, error, {
      url: req?.url,
      method: req?.method,
    });
    if (error instanceof HttpError) {
      return res.status(error.httpCode).json({
        code: error.httpCode || 500,
        name: error.name,
        message: error.message,
      });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        code: 404,
        name: 'Not Found',
        message: error.message,
      });
    }
    if (error instanceof Error) {
      return res.status(500).json({
        code: 500,
        name: 'Internal Server Error',
        message: error.message,
      });
    }

    if (
      (error as IError).httpCode ||
      (error as IError).name ||
      (error as IError).message
    ) {
      const _error = error as IError;
      return res.status(_error.httpCode).json({
        code: _error?.httpCode || 500,
        name: _error?.name || 'Internal Server Error',
        message: _error?.message || 'An error occurred',
      });
    }

    return res.status(500).json({
      code: 500,
      name: 'Internal Server Error',
      message: 'An error occurred',
    });
  }
}
