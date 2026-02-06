import { RequestContext } from "../middlewares";

export type Constructor<T = any> = new (...args: any[]) => T;

export type Token<T = any> = Constructor<T> | string | symbol;

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}