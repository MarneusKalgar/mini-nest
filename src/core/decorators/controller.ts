import { Constructor } from "../types";

const CONTROLLER_METADATA = Symbol('controller:metadata');
const ROUTES_METADATA = Symbol('routes:metadata');

export interface ControllerMetadata {
  path: string;
}

export interface RouteMetadata {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  propertyKey: string | symbol;
}

export function Controller(path: string = ''): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(CONTROLLER_METADATA, { path }, target);
  };
}

export function getControllerMetadata(target: Constructor): ControllerMetadata | undefined {
  return Reflect.getMetadata(CONTROLLER_METADATA, target);
}

export function getRoutes(target: InstanceType<Constructor>): RouteMetadata[] {
  return Reflect.getMetadata(ROUTES_METADATA, target.constructor) || [];
}

export function addRoute(target: InstanceType<Constructor>, route: RouteMetadata): void {
  const routes = Reflect.getMetadata(ROUTES_METADATA, target.constructor) || [];
  routes.push(route);
  Reflect.defineMetadata(ROUTES_METADATA, routes, target.constructor);
}
