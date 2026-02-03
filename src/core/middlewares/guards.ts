import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Container } from '../framework';
import { CanActivate, getGuardsMetadata } from '../decorators';
import { Constructor } from '../types';
import { ForbiddenError, ExpressExecutionContext } from '../common';

export function GuardsMiddleware(
  container: Container,
  globalGuards: (Constructor<CanActivate> | CanActivate)[]
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.context) {
        throw new Error('Request context not found. PreprocessingMiddleware must run first.');
      }

      const { controllerInstance, handlerName } = req.context;

      if (!controllerInstance || !handlerName) {
        throw new Error('Controller instance or handler name not found in request context.');
      }

      const routeGuards = getGuardsMetadata(controllerInstance, handlerName);
      const allGuards = [...routeGuards, ...globalGuards];

      // Create execution context
      const targetClass = controllerInstance.constructor;
      const targetHandler = controllerInstance[handlerName];
      const executionContext = new ExpressExecutionContext(
        targetClass,
        targetHandler,
        req,
        res
      );

      for (const guard of allGuards) {
        const guardInstance = typeof guard === 'function'
          ? container.has(guard) ? container.resolve(guard) : new guard()
          : guard;

        const canActivate = await guardInstance.canActivate(executionContext);

        if (!canActivate) {
          throw new ForbiddenError('Access denied');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}