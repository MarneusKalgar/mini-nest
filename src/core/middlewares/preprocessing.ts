import { Request, Response, NextFunction, RequestHandler } from 'express';
import { getParamMetadata, getPipesMetadata, extractParamValue } from '../decorators';
import { Constructor } from '../types';
import { ExpressExecutionContext, ExecutionContext } from '../common';

/**
 * Context information attached to the request for subsequent middleware
 */
export interface RequestContext {
  /** Raw parameter metadata from decorators */
  paramMetadata: ReturnType<typeof getParamMetadata>;
  /** Parameters sorted by their index in the handler function */
  sortedParams: ReturnType<typeof getParamMetadata>;
  /** Pipes metadata for the route */
  pipes: ReturnType<typeof getPipesMetadata>;
  /** Extracted argument values before transformation */
  extractedArgs: any[];
  /** Transformed argument values after pipes */
  transformedArgs?: any[];
  /** The controller instance */
  controllerInstance?: any;
  /** The handler method name */
  handlerName?: string | symbol;
  /** The execution context wrapper */
  executionContext?: ExecutionContext;
}

/**
 * Creates preprocessing middleware that extracts parameters and sets up request context
 * @param controllerInstance - The controller instance
 * @param handlerName - The handler method name
 * @returns Express request handler
 */
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

      const targetClass = controllerInstance.constructor;
      const targetHandler = controllerInstance[handlerName];
      const executionContext = new ExpressExecutionContext(
        targetClass,
        targetHandler,
        req,
        res
      );

      req.context = {
        paramMetadata,
        sortedParams,
        pipes,
        extractedArgs,
        controllerInstance,
        handlerName,
        executionContext,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}
