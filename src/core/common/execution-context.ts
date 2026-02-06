import { Request, Response } from 'express';

export interface ExecutionContext {
  getClass<T = any>(): Function;
  getHandler(): Function;
  switchToHttp(): HttpArgumentsHost;
}

export interface HttpArgumentsHost {
  getRequest<T = Request>(): T;
  getResponse<T = Response>(): T;
}

export class ExpressExecutionContext implements ExecutionContext {
  constructor(
    private readonly targetClass: Function,
    private readonly targetHandler: Function,
    private readonly req: Request,
    private readonly res: Response,
  ) {}

  getClass<T = any>(): Function {
    return this.targetClass;
  }

  getHandler(): Function {
    return this.targetHandler;
  }

  switchToHttp(): HttpArgumentsHost {
    return {
      getRequest: <T = Request>() => this.req as T,
      getResponse: <T = Response>() => this.res as T,
    };
  }
}