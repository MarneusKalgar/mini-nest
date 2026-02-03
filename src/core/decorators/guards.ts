import { Constructor } from '../types';
import { ExecutionContext } from '../common/execution-context';

export interface CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}

const GUARDS_METADATA = Symbol('guards:metadata');

export function UseGuards(...guards: (Constructor<CanActivate> | CanActivate)[]): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(GUARDS_METADATA, guards, target, propertyKey);
    return descriptor;
  };
}

export function getGuardsMetadata(target: Object, propertyKey: string | symbol): (Constructor<CanActivate> | CanActivate)[] {
  return Reflect.getMetadata(GUARDS_METADATA, target, propertyKey) || [];
}