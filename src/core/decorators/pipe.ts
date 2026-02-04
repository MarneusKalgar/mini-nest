import { Constructor } from '../types';
import { ExecutionContext } from '../common';

const PIPES_METADATA = Symbol('pipes:metadata');

export interface PipeTransform<T = any, R = any> {
  transform(value: T, metadata?: ArgumentMetadata): R | Promise<R>;
}

export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'headers';
  metatype?: Constructor;
  data?: string;
  executionContext?: ExecutionContext;
}

export function UsePipes(...pipes: (Constructor<PipeTransform> | PipeTransform)[]): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PIPES_METADATA, pipes, target, propertyKey);
    return descriptor;
  };
}

export function getPipesMetadata(target: Object, propertyKey: string | symbol): (Constructor<PipeTransform> | PipeTransform)[] {
  return Reflect.getMetadata(PIPES_METADATA, target, propertyKey) || [];
}
