/** Symbol key for storing roles metadata */
const ROLES_METADATA = Symbol('roles:metadata');

/**
 * Decorator to specify required roles for a route handler
 * @param roles - One or more role names required to access the route
 * @returns A method decorator
 * @example
 * ```typescript
 * @Roles('admin', 'moderator')
 * async deleteUser() {}
 * ```
 */
export function Roles(...roles: string[]): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(ROLES_METADATA, roles, target, propertyKey);
    return descriptor;
  };
}

/**
 * Retrieves the roles metadata from a method
 * @param target - The class instance containing the method
 * @param propertyKey - The method name
 * @returns An array of role names
 */
export function getRolesMetadata(target: Object, propertyKey: string | symbol): string[] {
  return Reflect.getMetadata(ROLES_METADATA, target, propertyKey) || [];
}