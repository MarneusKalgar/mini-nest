import { CanActivate, Injectable, getRolesMetadata } from '../../core/decorators';
import { ExecutionContext } from '../../core/common';

@Injectable()
export class RolesGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controllerClass = context.getClass();

    const requiredRoles = getRolesMetadata(controllerClass.prototype, handler.name);

    if (!requiredRoles?.length) {
      return true;
    }

    const userRole = request.headers['x-user-role'] as string;

    if (!userRole) {
      return false;
    }

    return requiredRoles.includes(userRole);
  }
}