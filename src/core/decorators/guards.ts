import { Constructor } from '../types';
import { ExecutionContext } from '../common/execution-context';

/**
 * Interface for guards that control access to route handlers
 */
export interface CanActivate {
  /**
   * Determines if the current request can activate the route
   * @param context - The execution context containing request information
   * @returns A boolean or promise resolving to boolean indicating if access is granted
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}

/** Symbol key for storing guards metadata */
const GUARDS_METADATA = Symbol('guards:metadata');

/**
 * Decorator to apply guards to a route handler
 * @param guards - One or more guard classes or instances
 * @returns A method decorator
 * @example
 * ```typescript
 * @UseGuards(AuthGuard, RolesGuard)
 * async handleRequest() {}
 * ```
 */
export function UseGuards(...guards: (Constructor<CanActivate> | CanActivate)[]): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(GUARDS_METADATA, guards, target, propertyKey);
    return descriptor;
  };
}

/**
 * Retrieves the guards metadata from a method
 * @param target - The class instance containing the method
 * @param propertyKey - The method name
 * @returns An array of guard classes or instances
 */
export function getGuardsMetadata(target: Object, propertyKey: string | symbol): (Constructor<CanActivate> | CanActivate)[] {
  return Reflect.getMetadata(GUARDS_METADATA, target, propertyKey) || [];
}