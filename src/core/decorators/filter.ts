import { Request, Response } from 'express';
import { Constructor } from '../types';
import { ExecutionContext } from '../common';

/**
 * Interface for exception filters that handle errors in route handlers
 * @template T - The type of exception to handle
 */
export interface ExceptionFilter<T = any> {
  /**
   * Catches and handles an exception
   * @param exception - The exception that was thrown
   * @param host - The execution context containing request/response
   */
  catch(exception: T, host: ExecutionContext): void | Promise<void>;
}

/**
 * Interface providing access to the request and response objects
 */
export interface ArgumentsHost {
  /**
   * Gets the request object
   * @template T - The request type (defaults to Express Request)
   * @returns The request object
   */
  getRequest<T = Request>(): T;
  /**
   * Gets the response object
   * @template T - The response type (defaults to Express Response)
   * @returns The response object
   */
  getResponse<T = Response>(): T;
}

/** Symbol key for storing exception filter metadata */
const FILTERS_METADATA = Symbol('filters:metadata');

/**
 * Decorator to apply exception filters to a route handler
 * @param filters - One or more exception filter classes or instances
 * @returns A method decorator
 * @example
 * ```typescript
 * @UseFilters(CustomExceptionFilter)
 * async handleRequest() {}
 * ```
 */
export function UseFilters(...filters: (Constructor<ExceptionFilter> | ExceptionFilter)[]): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(FILTERS_METADATA, filters, target, propertyKey);
    return descriptor;
  };
}

/**
 * Retrieves the exception filters metadata from a method
 * @param target - The class instance containing the method
 * @param propertyKey - The method name
 * @returns An array of exception filter classes or instances
 */
export function getFiltersMetadata(target: Object, propertyKey: string | symbol): (Constructor<ExceptionFilter> | ExceptionFilter)[] {
  return Reflect.getMetadata(FILTERS_METADATA, target, propertyKey) || [];
}
