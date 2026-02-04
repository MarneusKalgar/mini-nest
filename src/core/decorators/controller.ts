import { Constructor } from "../types";

/** Symbol key for storing controller metadata */
const CONTROLLER_METADATA = Symbol('controller:metadata');
/** Symbol key for storing routes metadata */
const ROUTES_METADATA = Symbol('routes:metadata');

/**
 * Metadata associated with a controller
 */
export interface ControllerMetadata {
  /** The base path for the controller's routes */
  path: string;
}

/**
 * Metadata associated with a route handler
 */
export interface RouteMetadata {
  /** HTTP method for the route */
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  /** Path segment for the route */
  path: string;
  /** The name of the method handler */
  propertyKey: string | symbol;
}

/**
 * Decorator that marks a class as a controller with a base path
 * @param path - The base path for all routes in this controller (default: '')
 * @returns A class decorator
 * @example
 * ```typescript
 * @Controller('api/users')
 * class UserController {}
 * ```
 */
export function Controller(path: string = ''): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(CONTROLLER_METADATA, { path }, target);
  };
}

/**
 * Retrieves the controller metadata from a class
 * @param target - The controller class constructor
 * @returns The controller metadata or undefined if not found
 */
export function getControllerMetadata(target: Constructor): ControllerMetadata | undefined {
  return Reflect.getMetadata(CONTROLLER_METADATA, target);
}

/**
 * Retrieves all routes defined in a controller instance
 * @param target - The controller instance
 * @returns An array of route metadata
 */
export function getRoutes(target: InstanceType<Constructor>): RouteMetadata[] {
  return Reflect.getMetadata(ROUTES_METADATA, target.constructor) || [];
}

/**
 * Adds a route to a controller's metadata
 * @param target - The controller instance
 * @param route - The route metadata to add
 */
export function addRoute(target: InstanceType<Constructor>, route: RouteMetadata): void {
  const routes = Reflect.getMetadata(ROUTES_METADATA, target.constructor) || [];
  routes.push(route);
  Reflect.defineMetadata(ROUTES_METADATA, routes, target.constructor);
}
