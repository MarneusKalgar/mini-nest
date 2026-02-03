const ROLES_METADATA = Symbol('roles:metadata');

export function Roles(...roles: string[]): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(ROLES_METADATA, roles, target, propertyKey);
    return descriptor;
  };
}

export function getRolesMetadata(target: Object, propertyKey: string | symbol): string[] {
  return Reflect.getMetadata(ROLES_METADATA, target, propertyKey) || [];
}