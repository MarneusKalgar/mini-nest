import { Constructor } from "../types";

export interface ModuleMetadata {
  imports?: Constructor[];
  controllers?: Constructor[];
  providers?: Constructor[];
  exports?: (Constructor | string | symbol)[];
}

const MODULE_METADATA = Symbol('module:metadata');

export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(MODULE_METADATA, metadata, target);
  };
}

export function getModuleMetadata(target: Constructor): ModuleMetadata {
  return Reflect.getMetadata(MODULE_METADATA, target) || {};
}
