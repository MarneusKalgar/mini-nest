import { Constructor } from "../types";

/**
 * Metadata for defining a module's dependencies and components
 */
export interface ModuleMetadata {
  /** Other modules to import */
  imports?: Constructor[];
  /** Controller classes to register */
  controllers?: Constructor[];
  /** Provider classes for dependency injection */
  providers?: Constructor[];
  /** Providers to be made available to other modules */
  exports?: (Constructor | string | symbol)[];
}

/** Symbol key for storing module metadata */
const MODULE_METADATA = Symbol('module:metadata');

/**
 * Decorator that defines a module and its dependencies
 * @param metadata - The module configuration
 * @returns A class decorator
 * @example
 * ```typescript
 * @Module({
 *   controllers: [UserController],
 *   providers: [UserService]
 * })
 * class UserModule {}
 * ```
 */
export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(MODULE_METADATA, metadata, target);
  };
}

/**
 * Retrieves the module metadata from a class
 * @param target - The module class constructor
 * @returns The module metadata or an empty object if not found
 */
export function getModuleMetadata(target: Constructor): ModuleMetadata {
  return Reflect.getMetadata(MODULE_METADATA, target) || {};
}
