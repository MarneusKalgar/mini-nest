import { Constructor, Token } from "../types";

/**
 * Provider configuration for dependency injection
 * @template T - The type of the provided instance
 */
interface Provider<T = any> {
  /** The token used to identify this provider */
  token: Token<T>;
  /** Cached instance of the provider */
  instance?: T;
  /** The class constructor to instantiate */
  useClass?: Constructor<T>;
}

/**
 * Interface for the dependency injection container
 */
interface ContainerInterface {
  /**
   * Registers a provider in the container
   * @template T - The type of the provider
   * @param token - The token to register
   * @param useClass - The class to instantiate (optional)
   */
  register<T>(token: Token<T>, useClass?: Constructor<T>): void;
  /**
   * Resolves a provider from the container
   * @template T - The type to resolve
   * @param token - The token to resolve
   * @returns The resolved instance
   */
  resolve<T>(token: Token<T>): T;
  /**
   * Clears all providers and instances from the container
   */
  clear(): void;
  /**
   * Checks if a token is registered in the container
   * @param token - The token to check
   * @returns True if the token is registered
   */
  has(token: Token): boolean;
}

/**
 * Dependency injection container implementation
 * Manages provider registration and instance creation with dependency resolution
 */
class Container implements ContainerInterface {
  private providers = new Map<Token, Provider>();
  private instances = new Map<Token, any>();

  constructor() {}

  /**
   * Registers a token with its corresponding class in the container
   * @template T - The type of the provider
   * @param token - The token to register
   * @param useClass - The class constructor to use for instantiation
   * @throws Error if the token is already registered
   */
  register<T>(token: Token<T>, useClass?: Constructor<T>): void {
    const provider: Provider<T> = {
      token,
      useClass: useClass || token as Constructor<T>,
    };

    if (this.providers.has(token)) {
      this.providers.set(token, provider);
      this.instances.delete(token);
      return;
    }

    this.providers.set(token, provider);
  }

  /**
   * Resolves a token to its instance, creating it if necessary
   * Automatically resolves and injects dependencies
   * @template T - The type to resolve
   * @param token - The token to resolve
   * @returns The resolved instance
   * @throws Error if the token is not registered or dependencies cannot be resolved
   */
  resolve<T>(token: Token<T>): T {
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }

    const provider = this.providers.get(token);
    if (!provider) {
      throw new Error(`No provider found for token: ${token.toString()}`);
    }

    const targetClass = provider.useClass;

    if (!targetClass) {
      throw new Error(`No class to instantiate for token: ${token.toString()}`);
    }

    const paramTypes: Constructor[] = Reflect.getMetadata('design:paramtypes', targetClass) || [];

    // Get custom injection tokens
    const injectionTokens: Token[] = [];
    for (let i = 0; i < paramTypes.length; i++) {
      const customToken = Reflect.getMetadata(`inject:${i}`, targetClass);
      injectionTokens.push(customToken || paramTypes[i]);
    }

    // Resolve dependencies
    const dependencies = injectionTokens.map((depToken, index) => {
      if (!depToken) {
        throw new Error(`Cannot resolve dependency at index ${index} for ${targetClass.name}`);
      }
      return this.resolve(depToken);
    });

    const instance = new targetClass(...dependencies) as T;
    this.instances.set(token, instance);
    return instance;
  }

  /**
   * Clears all registered providers and cached instances
   */
  clear(): void {
    this.providers.clear();
    this.instances.clear();
  }

  /**
   * Checks if a token is registered in the container
   * @param token - The token to check
   * @returns True if the token is registered, false otherwise
   */
  has(token: Token): boolean {
    return this.providers.has(token);
  }
}

/** Singleton instance of the DI container */
export const container  = new Container();
export type { Container };
