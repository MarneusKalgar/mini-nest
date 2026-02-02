import { Request } from 'express';

const PARAM_METADATA = Symbol('param:metadata');

export interface ParamMetadata {
  index: number;
  type: 'param' | 'body' | 'query' | 'headers';
  key?: string;
  pipe?: any;
}

export function Param(key?: string, pipe?: any): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA, target, propertyKey!) || [];
    existingParams.push({
      index: parameterIndex,
      type: 'param',
      key,
      pipe,
    });
    Reflect.defineMetadata(PARAM_METADATA, existingParams, target, propertyKey!);
  };
}

export function Body(key?: string): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA, target, propertyKey!) || [];
    existingParams.push({
      index: parameterIndex,
      type: 'body',
      key,
    });
    Reflect.defineMetadata(PARAM_METADATA, existingParams, target, propertyKey!);
  };
}

export function Query(key?: string): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA, target, propertyKey!) || [];
    existingParams.push({
      index: parameterIndex,
      type: 'query',
      key,
    });
    Reflect.defineMetadata(PARAM_METADATA, existingParams, target, propertyKey!);
  };
}

export function Headers(key?: string): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA, target, propertyKey!) || [];
    existingParams.push({
      index: parameterIndex,
      type: 'headers',
      key,
    });
    Reflect.defineMetadata(PARAM_METADATA, existingParams, target, propertyKey!);
  };
}

export function getParamMetadata(target: Object, propertyKey: string | symbol): ParamMetadata[] {
  return Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
}

export function extractParamValue(req: Request, metadata: ParamMetadata): any {
  switch (metadata.type) {
    case 'param':
      return metadata.key ? req.params[metadata.key] : req.params;
    case 'body':
      return metadata.key ? req.body?.[metadata.key] : req.body;
    case 'query':
      return metadata.key ? req.query[metadata.key] : req.query;
    case 'headers':
      return metadata.key ? req.headers[metadata.key.toLowerCase()] : req.headers;
    default:
      return undefined;
  }
}