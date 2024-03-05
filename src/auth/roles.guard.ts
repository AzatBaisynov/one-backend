import { Injectable, CanActivate, ExecutionContext} from '@nestjs/common'
import { Reflector } from "@nestjs/core"
import { UserRoleName } from "src/userRole/userRole.types"

@Injectable()
export class RoleGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext) {
		const requiredRoles = this.reflector.getAllAndOverride<UserRoleName[]>('roles', [
			context.getHandler(),
			context.getClass(),
		]);
		if (!requiredRoles) {
			return true;
		}
		const { user } = context.switchToHttp().getRequest();
		return requiredRoles.some((role) => user?.roles?.includes(role));
	}
}