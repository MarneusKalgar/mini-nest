import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const joinPaths = (...paths: string[]): string => {
  return '/' + paths
    .filter(p => p)
    .map(p => p.replace(/^\/|\/$/g, ''))
    .filter(p => p)
    .join('/');
};
