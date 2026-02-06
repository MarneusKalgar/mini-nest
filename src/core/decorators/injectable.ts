import { container } from '../framework';
import { Constructor, Token } from '../types';

/** Symbol key for storing injectable metadata */
const INJECTABLE_METADATA = Symbol('injectable:metadata');

/**
 * Options for configuring an injectable class
 */
export interface InjectableOptions {
  /** Custom token for dependency injection (optional) */
  token?: Token;
}

/**
 * Decorator that marks a class as injectable and registers it in the DI container
 * @param options - Optional configuration for the injectable
 * @returns A class decorator
 * @example
 * ```typescript
 * @Injectable()
 * class UserService {}
 * ```
 */
export function Injectable(options?: InjectableOptions): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(INJECTABLE_METADATA, true, target);
    const token = options?.token || target as Constructor;
    container.register(token, target as Constructor);
  };
}

/**
 * Checks if a class is marked as injectable
 * @param target - The class constructor to check
 * @returns True if the class is injectable, false otherwise
 */
export function isInjectable(target: Constructor): boolean {
  return Reflect.getMetadata(INJECTABLE_METADATA, target) === true;
}
