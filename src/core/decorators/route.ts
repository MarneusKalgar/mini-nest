import { Constructor } from '../types';
import { addRoute, RouteMetadata } from './controller';

/**
 * Creates a route method decorator for a specific HTTP method
 * @param method - The HTTP method (get, post, put, patch, delete)
 * @returns A function that creates method decorators
 */
function createMethodDecorator(method: RouteMetadata['method']) {
  return (path: string = ''): MethodDecorator => {
    return (target: InstanceType<Constructor>, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      addRoute(target, {
        method,
        path,
        propertyKey,
      });
      return descriptor;
    };
  };
}

/** Decorator for HTTP GET requests */
export const Get = createMethodDecorator('get');
/** Decorator for HTTP POST requests */
export const Post = createMethodDecorator('post');
/** Decorator for HTTP PUT requests */
export const Put = createMethodDecorator('put');
/** Decorator for HTTP PATCH requests */
export const Patch = createMethodDecorator('patch');
/** Decorator for HTTP DELETE requests */
export const Delete = createMethodDecorator('delete');
