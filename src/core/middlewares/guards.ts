import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Container } from '../framework';
import { CanActivate, getGuardsMetadata } from '../decorators';
import { Constructor } from '../types';
import { ForbiddenError } from '../common';

export function GuardsMiddleware(
  container: Container,
  globalGuards: (Constructor<CanActivate> | CanActivate)[]
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.context) {
        throw new Error('Request context not found. PreprocessingMiddleware must run first.');
      }

      const { controllerInstance, handlerName, executionContext } = req.context;

      if (!controllerInstance || !handlerName || !executionContext) {
        throw new Error('Controller instance, handler name, or execution context not found in request context.');
      }

      const routeGuards = getGuardsMetadata(controllerInstance, handlerName);
      const allGuards = [...routeGuards, ...globalGuards];

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