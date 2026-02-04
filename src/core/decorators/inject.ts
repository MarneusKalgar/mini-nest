import { Token } from "../types";

/**
 * Parameter decorator for custom dependency injection
 * @param token - The token to use for resolving the dependency
 * @returns A parameter decorator
 * @example
 * ```typescript
 * constructor(@Inject('CONFIG') config: Config) {}
 * ```
 */
export function Inject(token: Token): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    Reflect.defineMetadata(`inject:${parameterIndex}`, token, target);
  };
}