import { Constructor } from '../types';
import { ExecutionContext } from '../common';

/** Symbol key for storing pipes metadata */
const PIPES_METADATA = Symbol('pipes:metadata');
/** Symbol key for storing controller-level pipes metadata */
const CONTROLLER_PIPES_METADATA = Symbol('controller:pipes:metadata');

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
 * Creates a method-level pipe decorator
 * @param pipes - One or more pipe classes or instances
 * @returns A method decorator
 */
function createMethodPipeDecorator(...pipes: (Constructor<PipeTransform> | PipeTransform)[]): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PIPES_METADATA, pipes, target, propertyKey);
    return descriptor;
  };
}

/**
 * Creates a class-level pipe decorator
 * @param pipes - One or more pipe classes or instances
 * @returns A class decorator
 */
function createClassPipeDecorator(...pipes: (Constructor<PipeTransform> | PipeTransform)[]): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(CONTROLLER_PIPES_METADATA, pipes, target);
  };
}

/**
 * Main pipes decorator factory
 * @example
 * ```typescript
 * // Method-level
 * @UsePipes.Method(ValidationPipe)
 * async createUser(@Body() dto: CreateUserDto) {}
 * 
 * // Controller-level
 * @UsePipes.Class(LoggingPipe, ValidationPipe)
 * class UserController {}
 * ```
 */
export const UsePipes = {
  /**
   * Apply pipes to a specific route handler method
   * @param pipes - One or more pipe classes or instances
   * @returns A method decorator
   */
  Method: createMethodPipeDecorator,

  /**
   * Apply pipes to all routes in a controller
   * @param pipes - One or more pipe classes or instances
   * @returns A class decorator
   */
  Class: createClassPipeDecorator,
};

/**
 * Retrieves the pipes metadata from a method
 * @param target - The class instance containing the method
 * @param propertyKey - The method name
 * @returns An array of pipe classes or instances
 */
export function getPipesMetadata(target: Object, propertyKey: string | symbol): (Constructor<PipeTransform> | PipeTransform)[] {
  return Reflect.getMetadata(PIPES_METADATA, target, propertyKey) || [];
}

/**
 * Retrieves the controller-level pipes metadata from a class
 * @param target - The controller class or instance
 * @returns An array of pipe classes or instances
 */
export function getControllerPipesMetadata(target: Object): (Constructor<PipeTransform> | PipeTransform)[] {
  // If target is an instance, get its constructor
  const constructor = typeof target === 'function' ? target : target.constructor;
  return Reflect.getMetadata(CONTROLLER_PIPES_METADATA, constructor) || [];
}
