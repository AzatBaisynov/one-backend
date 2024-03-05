import { Module } from "@nestjs/common";
import { UserAndUserRoleModuleConfig } from "src/config/module.config";
import { ProductController } from "./product.controller";
import { ScheduleModule } from "@nestjs/schedule"


@Module({
	imports: [ScheduleModule.forRoot(), UserAndUserRoleModuleConfig.entityImports],
	controllers: [ProductController],
	providers: UserAndUserRoleModuleConfig.providers
})
export class ProductModule {

}