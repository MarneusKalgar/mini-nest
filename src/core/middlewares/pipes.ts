import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Container } from '../framework';
import { PipeTransform } from '../decorators';
import { Constructor } from '../types';

export function PipesMiddleware(
  container: Container,
  globalPipes: (Constructor<PipeTransform> | PipeTransform)[]
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.context) {
        throw new Error('Request context not found. PreprocessingMiddleware must run first.');
      }

      const { pipes: routePipes, extractedArgs, sortedParams, controllerInstance, handlerName } = req.context;

      const allPipes = [...globalPipes, ...routePipes];

      if (!controllerInstance || !handlerName) {
        throw new Error('Controller instance or handler name not found in request context.');
      }

      const transformedArgs = await Promise.all(
        extractedArgs.map(async (value, index) => {
          let transformedValue = value;

          const paramTypes = Reflect.getMetadata('design:paramtypes', controllerInstance, handlerName) || [];
          const paramMeta = sortedParams[index];
          const paramPipes = paramMeta.pipe ? [paramMeta.pipe] : [];
          const pipesToApply = [...paramPipes, ...allPipes]
          
          for (const pipe of pipesToApply) {
            const pipeInstance = typeof pipe === 'function' 
              ? container.has(pipe) ? container.resolve(pipe) : new pipe()
              : pipe;

            transformedValue = await pipeInstance.transform(transformedValue, {
              type: sortedParams[index].type,
              data: sortedParams[index].key,
              metatype: paramTypes[index],
            });
          }

          return transformedValue;
        })
      );

      req.context.transformedArgs = transformedArgs;

      next();
    } catch (error) {
      next(error);
    }
  };
}