import express, { Express } from 'express';
import { CanActivate, ExceptionFilter, getControllerMetadata, getModuleMetadata, getRoutes, PipeTransform, RouteMetadata } from '../decorators';
import { container } from './container';
import { joinPaths, asyncHandler } from '../utils';
import { Constructor } from '../types';
import { createRequestHandler, ExceptionFilterMiddleware, GuardsMiddleware, PipesMiddleware, PreprocessingMiddleware } from '../middlewares';

/**
 * Options interface for the application factory
 */
interface FactoryOptions {
  /**
   * Starts the HTTP server on the specified port
   * @param port - The port number to listen on
   */
  listen(port: number): Promise<void>;
  /**
   * Gets the underlying Express application instance
   * @returns The Express app
   */
  getHttpServer(): Express;
  /**
   * Registers global pipes to be applied to all routes
   * @param pipes - Pipe classes or instances
   */
  useGlobalPipes(...pipes: (Constructor<PipeTransform> | PipeTransform)[]): void;
  /**
   * Registers global exception filters
   * @param filters - Filter classes or instances
   */
  useGlobalFilters(...filters: (Constructor<ExceptionFilter> | ExceptionFilter)[]): void;
  /**
   * Registers global guards to be applied to all routes
   * @param guards - Guard classes or instances
   */
  useGlobalGuards(...guards: (Constructor<CanActivate> | CanActivate)[]): void;
}

/**
 * Application factory class that bootstraps the framework
 * Handles module initialization, route registration, and middleware setup
 */
export class Factory implements FactoryOptions {
  private readonly app: Express;
  private globalPipes: (Constructor<PipeTransform> | PipeTransform)[] = [];
  private globalFilters: (Constructor<ExceptionFilter> | ExceptionFilter)[] = [];
  private globalGuards: (Constructor<CanActivate> | CanActivate)[] = [];

  /**
   * Creates a new factory instance
   * @param moduleClass - The root module class
   */
  constructor(private moduleClass: Constructor) {
    this.app = express();
    this.setupMiddleware();
  }

  /**
   * Creates and initializes a new application factory
   * @param moduleClass - The root module class
   * @returns A configured factory instance
   */
  static create(moduleClass: Constructor): Factory {
    const factory = new Factory(moduleClass);
    factory.initializeModule();
    return factory;
  }

  /**
   * Sets up basic Express middleware for JSON and URL-encoded parsing
   */
  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  /**
   * Initializes the root module and registers all components
   */
  private initializeModule(): void {
    const metadata = getModuleMetadata(this.moduleClass);

    if (metadata.imports) {
      for (const importedModule of metadata.imports) {
        this.registerModules(importedModule);
      }
    }

    if (metadata.controllers) {
      this.registerControllers(metadata.controllers);
    }

    this.app.use(ExceptionFilterMiddleware(container, this.globalFilters));
  }

  /**
   * Recursively registers a module and its imports
   * @param module - The module class to register
   */
  private registerModules(module: Constructor): void {
    const metadata = getModuleMetadata(module);

    if (metadata.imports) {
      for (const importedModule of metadata.imports) {
        this.registerModules(importedModule);
      }
    }

    if (metadata.controllers) {
      this.registerControllers(metadata.controllers);
    }
  }

  /**
   * Registers controllers and their routes
   * @param controllers - Array of controller classes to register
   */
  private registerControllers(controllers: InstanceType<Constructor>[]): void {
    for (const controllerClass of controllers) {
      if (!container.has(controllerClass)) {
        container.register(controllerClass, controllerClass);
      }

      const controllerMetadata = getControllerMetadata(controllerClass);

      if (!controllerMetadata) {
        console.warn(`Controller ${controllerClass.name} is missing @Controller decorator`);
        continue;
      }

      const controllerInstance = container.resolve<InstanceType<Constructor>>(controllerClass);
      const routes = getRoutes(controllerInstance);
      this.mapRoutes(controllerInstance, controllerMetadata.path, routes);
    }
  }

  /**
   * Maps routes from a controller to Express routes
   * @param controllerInstance - The controller instance
   * @param basePath - The base path for the controller
   * @param routes - Array of route metadata
   */
  private mapRoutes(controllerInstance: InstanceType<Constructor>, basePath: string, routes: RouteMetadata[]): void {
    for (const route of routes) {
      const fullPath = joinPaths(basePath, route.path);
      const handler = controllerInstance[route.propertyKey];

      if (typeof handler !== 'function') {
        console.warn(`Handler ${String(route.propertyKey)} is not a function`);
        continue;
      }

      this.app[route.method](
        fullPath,
        asyncHandler(PreprocessingMiddleware(controllerInstance, route.propertyKey)),
        asyncHandler(GuardsMiddleware(container, this.globalGuards)),
        asyncHandler(PipesMiddleware(container, this.globalPipes)),
        asyncHandler(createRequestHandler(handler, controllerInstance))
      );

      console.log(`Mapped {${fullPath}, ${route.method.toUpperCase()}} route`);
    }
  }

  /**
   * Registers global pipes to be applied to all routes
   * @param pipes - Pipe classes or instances
   */
  useGlobalPipes(...pipes: (Constructor<PipeTransform> | PipeTransform)[]): void {
    this.globalPipes.push(...pipes);
  }

  /**
   * Registers global exception filters
   * @param filters - Filter classes or instances
   */
  useGlobalFilters(...filters: (Constructor<ExceptionFilter> | ExceptionFilter)[]): void {
    this.globalFilters.push(...filters);
  }

  /**
   * Registers global guards to be applied to all routes
   * @param guards - Guard classes or instances
   */
  useGlobalGuards(...guards: (Constructor<CanActivate> | CanActivate)[]): void {
    this.globalGuards.push(...guards);
  }

  /**
   * Starts the HTTP server
   * @param port - The port number to listen on
   * @param callback - Optional callback executed when server starts
   * @returns A promise that resolves when the server is listening
   */
  async listen(port: number, callback?: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        if (callback) {
          callback();
        }
        resolve();
      });
    });
  }

  /**
   * Gets the underlying Express application instance
   * @returns The Express app
   */
  getHttpServer(): Express {
    return this.app;
  }
}
