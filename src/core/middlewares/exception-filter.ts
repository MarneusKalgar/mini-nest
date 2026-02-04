import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Container } from '../framework';
import { Constructor } from '../types';
import { getFiltersMetadata, ExceptionFilter } from '../decorators';

export function ExceptionFilterMiddleware(
  container: Container,
  globalFilters: (Constructor<ExceptionFilter> | ExceptionFilter)[]
): ErrorRequestHandler {
  return async (error: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return;
    }

    try {
      const routeFilters: (Constructor<ExceptionFilter> | ExceptionFilter)[] = 
        req.context?.controllerInstance && req.context?.handlerName
          ? getFiltersMetadata(req.context.controllerInstance, req.context.handlerName)
          : [];

      const allFilters = [...routeFilters, ...globalFilters];
      const executionContext = req.context?.executionContext;

      for (const filter of allFilters) {
        const filterInstance = typeof filter === 'function'
          ? container.has(filter) ? container.resolve(filter) : new filter()
          : filter;

        await filterInstance.catch(error, executionContext!);
        
        if (res.headersSent) {
          return;
        }
      }
    } catch (filterError) {
      console.error('Error in exception filter:', filterError);
    }
  };
}
