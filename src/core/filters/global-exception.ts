import { Request, Response } from 'express';
import { ExceptionFilter } from '../decorators';
import { HttpStatusCodes, BaseError, ExecutionContext } from '../common';

/**
 * Global exception filter that handles all unhandled exceptions
 * Provides consistent error response formatting
 */
export class GlobalExceptionFilter implements ExceptionFilter {
  /**
   * Catches and processes exceptions, sending formatted error responses
   * @param exception - The caught exception
   * @param host - The execution context containing request/response
   */
  catch(exception: any, host: ExecutionContext): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

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
