import { Token } from "../types";

export function Inject(token: Token): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    Reflect.defineMetadata(`inject:${parameterIndex}`, token, target);
  };
}