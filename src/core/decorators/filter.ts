import { Request, Response } from 'express';
import { Constructor } from '../types';

export interface ExceptionFilter<T = any> {
  catch(exception: T, request: Request, response: Response): void | Promise<void>;
}

export interface ArgumentsHost {
  getRequest<T = Request>(): T;
  getResponse<T = Response>(): T;
}

const FILTERS_METADATA = Symbol('filters:metadata');

export function UseFilters(...filters: (Constructor<ExceptionFilter> | ExceptionFilter)[]): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(FILTERS_METADATA, filters, target, propertyKey);
    return descriptor;
  };
}

export function getFiltersMetadata(target: Object, propertyKey: string | symbol): (Constructor<ExceptionFilter> | ExceptionFilter)[] {
  return Reflect.getMetadata(FILTERS_METADATA, target, propertyKey) || [];
}
