import { container } from '../framework';
import { Constructor, Token } from '../types';

const INJECTABLE_METADATA = Symbol('injectable:metadata');

export interface InjectableOptions {
  token?: Token;
}

export function Injectable(options?: InjectableOptions): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(INJECTABLE_METADATA, true, target);
    const token = options?.token || target as Constructor;
    container.register(token, target as Constructor);
  };
}

export function isInjectable(target: Constructor): boolean {
  return Reflect.getMetadata(INJECTABLE_METADATA, target) === true;
}