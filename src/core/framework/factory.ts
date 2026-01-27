import express, { Express } from 'express';
import { getControllerMetadata, getModuleMetadata, getRoutes, RouteMetadata } from '../decorators';
import { container } from './container';
import { joinPaths, wrapHandler } from '../utils';
import { Constructor } from '../types';

interface FactoryOptions {
  listen(port: number): Promise<void>;
  getHttpServer(): Express;
}

export class Factory implements FactoryOptions {
  private readonly app: Express;

  constructor(private moduleClass: Constructor) {
    this.app = express();
    this.setupMiddleware();
  }

  static create(moduleClass: Constructor): Factory {
    const factory = new Factory(moduleClass);
    factory.initializeModule();
    return factory;
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

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
  }

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

  private mapRoutes(controllerInstance: InstanceType<Constructor>, basePath: string, routes: RouteMetadata[]): void {
    for (const route of routes) {
      const fullPath = joinPaths(basePath, route.path);
      const handler = controllerInstance[route.propertyKey];

      if (typeof handler !== 'function') {
        console.warn(`Handler ${String(route.propertyKey)} is not a function`);
        continue;
      }

      this.app[route.method](fullPath, wrapHandler(handler, controllerInstance));
      console.log(`Mapped {${fullPath}, ${route.method.toUpperCase()}} route`);
    }
  }

  async listen(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        resolve();
      });
    });
  }

  getHttpServer(): Express {
    return this.app;
  }
}