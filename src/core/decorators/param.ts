import { Request } from 'express';

/** Symbol key for storing parameter metadata */
const PARAM_METADATA = Symbol('param:metadata');

/**
 * Metadata for a route handler parameter
 */
export interface ParamMetadata {
  /** The parameter's position in the handler function */
  index: number;
  /** The type of parameter data to extract */
  type: 'param' | 'body' | 'query' | 'headers';
  /** Optional key to extract specific property from the data source */
  key?: string;
  /** Optional pipe for transforming/validating the parameter */
  pipe?: any;
}

/**
 * Parameter decorator to extract route parameters
 * @param key - Optional key to extract a specific parameter (if omitted, returns all params)
 * @param pipe - Optional pipe for data transformation/validation
 * @returns A parameter decorator
 * @example
 * ```typescript
 * async getUser(@Param('id') id: string) {}
 * ```
 */
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

/**
 * Parameter decorator to extract the request body
 * @param keyOrPipe - Optional key to extract a specific property, or a pipe for validation
 * @param pipe - Optional pipe for data transformation/validation (when first arg is a key)
 * @returns A parameter decorator
 * @example
 * ```typescript
 * // Extract entire body with validation
 * async createUser(@Body(new ValidationPipe(schema)) dto: CreateUserDto) {}
 * 
 * // Extract specific property
 * async updateUser(@Body('name') name: string) {}
 * 
 * // Extract specific property with validation
 * async updateUser(@Body('name', new ParseIntPipe()) name: number) {}
 * ```
 */
export function Body(keyOrPipe?: string | any, pipe?: any): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA, target, propertyKey!) || [];

    // Determine if first argument is a key (string) or a pipe (object)
    const isKey = typeof keyOrPipe === 'string';

    existingParams.push({
      index: parameterIndex,
      type: 'body',
      key: isKey ? keyOrPipe : undefined,
      pipe: isKey ? pipe : keyOrPipe,
    });
    Reflect.defineMetadata(PARAM_METADATA, existingParams, target, propertyKey!);
  };
}

/**
 * Parameter decorator to extract query parameters
 * @param key - Optional key to extract a specific query parameter (if omitted, returns all query params)
 * @param pipe - Optional pipe for data transformation/validation
 * @returns A parameter decorator
 * @example
 * ```typescript
 * async getUsers(@Query('page') page: number) {}
 * ```
 */
export function Query(key?: string, pipe?: any): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA, target, propertyKey!) || [];
    existingParams.push({
      index: parameterIndex,
      type: 'query',
      key,
      pipe,
    });
    Reflect.defineMetadata(PARAM_METADATA, existingParams, target, propertyKey!);
  };
}

/**
 * Parameter decorator to extract request headers
 * @param key - Optional key to extract a specific header (if omitted, returns all headers)
 * @returns A parameter decorator
 * @example
 * ```typescript
 * async handleRequest(@Headers('authorization') auth: string) {}
 * ```
 */
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

/**
 * Retrieves parameter metadata for a method
 * @param target - The class instance containing the method
 * @param propertyKey - The method name
 * @returns An array of parameter metadata
 */
export function getParamMetadata(target: Object, propertyKey: string | symbol): ParamMetadata[] {
  return Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
}

/**
 * Extracts the parameter value from the request based on metadata
 * @param req - The Express request object
 * @param metadata - The parameter metadata
 * @returns The extracted value from the request
 */
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