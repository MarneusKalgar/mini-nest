import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Constructor } from '../types';

/**
 * Creates a request handler that executes the controller method
 * @param handler - The controller method to execute
 * @param controllerInstance - The controller instance
 * @returns Express request handler
 */
export function createRequestHandler(
  handler: Function,
  controllerInstance: InstanceType<Constructor>
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.context) {
        throw new Error('Request context not found. PreprocessingMiddleware must run first.');
      }

      const args = req.context.transformedArgs || req.context.extractedArgs;
      const result = await handler.call(controllerInstance, ...args);

      if (result !== undefined && !res.headersSent) {
        res.json(result);
      }
    } catch (error) {
      next(error);
    }
  };
}