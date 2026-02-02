import { Constructor, Token } from "../types";

interface Provider<T = any> {
  token: Token<T>;
  instance?: T;
  useClass?: Constructor<T>;
}

interface ContainerInterface {
  register<T>(token: Token<T>, useClass?: Constructor<T>): void;
  resolve<T>(token: Token<T>): T;
  clear(): void;
  has(token: Token): boolean;
}

class Container implements ContainerInterface {
  private providers = new Map<Token, Provider>();
  private instances = new Map<Token, any>();

  constructor() {}

  register<T>(token: Token<T>, useClass?: Constructor<T>): void {
    if (this.providers.has(token)) {
      throw new Error(`Token ${token.toString()} is already registered`);
    }

    this.providers.set(token, {
      token,
      useClass: useClass || token as Constructor<T>,
    });
  }

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

  clear(): void {
    this.providers.clear();
    this.instances.clear();
  }

  has(token: Token): boolean {
    return this.providers.has(token);
  }
}

export const container  = new Container();
export type { Container };
