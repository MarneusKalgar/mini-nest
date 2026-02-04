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
      return next(error);
    }

    try {
      const routeFilters: (Constructor<ExceptionFilter> | ExceptionFilter)[] = 
        req.context?.controllerInstance && req.context?.handlerName
          ? getFiltersMetadata(req.context.controllerInstance, req.context.handlerName)
          : [];

      const allFilters = [...routeFilters, ...globalFilters];

      if (!allFilters.length) {
        return next(error);
      }

      const executionContext = req.context?.executionContext;

      for (const filter of allFilters) {
        const filterInstance = typeof filter === 'function'
          ? container.has(filter) ? container.resolve(filter) : new filter()
          : filter;

        // if (executionContext) {
        await filterInstance.catch(error, executionContext!);
        // } else {
        //   // Fallback: create temporary execution context
        //   const { ExpressExecutionContext } = await import('../common');
        //   const tempContext = new ExpressExecutionContext(
        //     Object.getPrototypeOf(req.context?.controllerInstance).constructor,
        //     () => {},
        //     req,
        //     res
        //   );
        //   await filterInstance.catch(error, tempContext);
        // }
        
        if (res.headersSent) {
          return;
        }
      }

      next(error);
    } catch (filterError) {
      console.error('Error in exception filter:', filterError);
      next(filterError);
    }
  };
}
