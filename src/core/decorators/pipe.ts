import { Constructor } from '../types';
import { ExecutionContext } from '../common';

/** Symbol key for storing pipes metadata */
const PIPES_METADATA = Symbol('pipes:metadata');

/**
 * Interface for pipe transformers that process and validate data
 * @template T - The input type
 * @template R - The return type
 */
export interface PipeTransform<T = any, R = any> {
  /**
   * Transforms and validates a value
   * @param value - The value to transform
   * @param metadata - Metadata about the argument being processed
   * @returns The transformed value
   */
  transform(value: T, metadata?: ArgumentMetadata): R | Promise<R>;
}

/**
 * Metadata about an argument being processed by a pipe
 */
export interface ArgumentMetadata {
  /** The type of parameter (body, query, param, or headers) */
  type: 'body' | 'query' | 'param' | 'headers';
  /** The TypeScript type of the parameter */
  metatype?: Constructor;
  /** The parameter key or name */
  data?: string;
  /** The execution context */
  executionContext?: ExecutionContext;
}

/**
 * Decorator to apply pipes to a route handler
 * @param pipes - One or more pipe classes or instances
 * @returns A method decorator
 * @example
 * ```typescript
 * @UsePipes(ValidationPipe)
 * async createUser(@Body() dto: CreateUserDto) {}
 * ```
 */
export function UsePipes(...pipes: (Constructor<PipeTransform> | PipeTransform)[]): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PIPES_METADATA, pipes, target, propertyKey);
    return descriptor;
  };
}

/**
 * Retrieves the pipes metadata from a method
 * @param target - The class instance containing the method
 * @param propertyKey - The method name
 * @returns An array of pipe classes or instances
 */
export function getPipesMetadata(target: Object, propertyKey: string | symbol): (Constructor<PipeTransform> | PipeTransform)[] {
  return Reflect.getMetadata(PIPES_METADATA, target, propertyKey) || [];
}
