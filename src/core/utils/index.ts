import { Request, Response, NextFunction } from 'express';
import { Constructor } from '../types';

export function wrapHandler(handler: Function, controllerInstance:  InstanceType<Constructor>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await handler.call(controllerInstance, req, res, next);

      // If handler didn't send response, send the result
      if (result !== undefined && !res.headersSent) {
        res.json(result);
      }
    } catch (error) {
      next(error);
    }
  };
};

export const joinPaths = (...paths: string[]): string => {
  return '/' + paths
    .filter(p => p)
    .map(p => p.replace(/^\/|\/$/g, ''))
    .filter(p => p)
    .join('/');
};
