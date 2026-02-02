import { Request, Response, NextFunction, RequestHandler } from 'express';
import { getParamMetadata, getPipesMetadata, extractParamValue } from '../decorators';
import { Constructor } from '../types';

export interface RequestContext {
  paramMetadata: ReturnType<typeof getParamMetadata>;
  sortedParams: ReturnType<typeof getParamMetadata>;
  pipes: ReturnType<typeof getPipesMetadata>;
  extractedArgs: any[];
  transformedArgs?: any[];
  controllerInstance?: any;
  handlerName?: string | symbol;
}

export function PreprocessingMiddleware(
  controllerInstance: InstanceType<Constructor>,
  handlerName: string | symbol
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramMetadata = getParamMetadata(controllerInstance, handlerName);
      const sortedParams = paramMetadata.sort((a, b) => a.index - b.index);
      const pipes = getPipesMetadata(controllerInstance, handlerName);

      const extractedArgs = sortedParams.map(metadata => extractParamValue(req, metadata));

      req.context = {
        paramMetadata,
        sortedParams,
        pipes,
        extractedArgs,
        controllerInstance,
        handlerName,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}
