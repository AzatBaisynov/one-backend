import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from "src/user/user.service";
import { User } from "src/user/user.entity";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";
import { AuthController } from "./auth.controller";
import { LocalStrategy } from "./local.strategy";
import { Confirmation } from "src/confirmation/confirmation.entity";
import { ConfirmationService } from "src/confirmation/confirmation.service";
import { UserRole } from "src/userRole/userRole.entity";
import { UserRoleService } from "src/userRole/userRole.service";
import { ProductModule } from "src/product/product.module";
import { StorageModule } from "src/storage/storage.module";
import { UserRoleModule } from "src/userRole/userRole.module";
import { UserAndUserRoleModuleConfig } from "src/config/module.config";

@Module({
	imports: [
		UserAndUserRoleModuleConfig.entityImports,
		UserModule,
		PassportModule,
		ProductModule,
		StorageModule,
		UserRoleModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: { expiresIn: '300h' }
			}),
			inject: [ConfigService]
		})
	],
	controllers: [ AuthController ],
	providers: [...UserAndUserRoleModuleConfig.providers],
})
export class AuthModule { }