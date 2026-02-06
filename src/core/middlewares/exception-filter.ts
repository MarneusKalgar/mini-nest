import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Container } from '../framework';
import { Constructor } from '../types';
import { getFiltersMetadata, ExceptionFilter } from '../decorators';

/**
 * Creates middleware for handling exceptions with registered filters
 * @param container - The DI container for resolving filter instances
 * @param globalFilters - Global exception filters to apply to all routes
 * @returns Express error request handler
 */
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

      const allFilters = [...globalFilters, ...routeFilters];
      const executionContext = req.context?.executionContext;

      if (!executionContext) {
        console.error('Execution context not found:', error);
        if (!res.headersSent) {
          res.status(500).json({ 
            message: 'Internal Server Error',
            error: error.message 
          });
        }
        return;
      }

      for (const filter of allFilters) {
        const filterInstance = typeof filter === 'function'
          ? container.has(filter) ? container.resolve(filter) : new filter()
          : filter;

        await filterInstance.catch(error, executionContext);

        if (res.headersSent) {
          return;
        }
      }
    } catch (filterError) {
      console.error('Error in exception filter:', filterError);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  };
}
