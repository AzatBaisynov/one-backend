import { Module } from "@nestjs/common/decorators";
import { UserAndUserRoleModuleConfig } from "src/config/module.config";
import { StorageController } from "./storage.controller";

@Module({
	imports: [UserAndUserRoleModuleConfig.entityImports],
	controllers: [StorageController],
	providers: UserAndUserRoleModuleConfig.providers
})
export class StorageModule {}