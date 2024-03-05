import { Provider, DynamicModule } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Confirmation } from "src/confirmation/confirmation.entity"
import { ConfirmationService } from "src/confirmation/confirmation.service"
import { User } from "src/user/user.entity"
import { UserService } from "src/user/user.service"
import { UserRole } from "src/userRole/userRole.entity"
import { UserRoleService } from "src/userRole/userRole.service"
import { Storage } from "src/storage/storage.entity"
import { StorageService } from "src/storage/storage.service"
import { Product } from "src/product/product.entity"
import { ProductService } from "src/product/product.service"
import { AuthService } from "src/auth/auth.service"
import { LocalStrategy } from "src/auth/local.strategy"
import { JwtStrategy } from "src/auth/jwt.strategy"
import { JwtService } from "@nestjs/jwt"

type ModuleConfigType = {
	entityImports: DynamicModule,
	providers: Provider[]
}

export const UserAndUserRoleModuleConfig: ModuleConfigType = {
	entityImports: TypeOrmModule.forFeature([User, Confirmation, UserRole, Storage, Product]),
	providers: [UserService, ConfirmationService, UserRoleService, StorageService, ProductService, AuthService, LocalStrategy, JwtStrategy, JwtService]
}