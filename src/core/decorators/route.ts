import { Constructor } from '../types';
import { addRoute, RouteMetadata } from './controller';

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

export const Get = createMethodDecorator('get');
export const Post = createMethodDecorator('post');
export const Put = createMethodDecorator('put');
export const Patch = createMethodDecorator('patch');
export const Delete = createMethodDecorator('delete');
