import { Request, Response } from 'express';
import { ExceptionFilter } from '../decorators';
import { HttpStatusCodes, BaseError } from '../common';

export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, req: Request, res: Response): void {
    let status = HttpStatusCodes.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof BaseError) {
      status = exception.httpCode;
      message = exception.message;
      error = exception.name;
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
      error,
      message,
    };

    if (process.env.NODE_ENV === 'development') {
      Object.assign(errorResponse, { stack: exception.stack });
    }

    res.status(status).json(errorResponse);
  }
}
