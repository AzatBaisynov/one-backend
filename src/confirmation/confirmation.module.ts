import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Confirmation } from "./confirmation.entity";
import { ConfirmationService } from "./confirmation.service";
import { UserAndUserRoleModuleConfig } from "src/config/module.config";

@Module({
	imports: [UserAndUserRoleModuleConfig.entityImports],
	controllers: [],
	providers: UserAndUserRoleModuleConfig.providers
})
export class ConfirmationModule { }