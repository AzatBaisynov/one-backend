import { Controller, Get, Post, Body, Param, UploadedFile, UseGuards, UseInterceptors, Request, Res } from "@nestjs/common";
import { UserService } from "./user.service";
import { ConfigService } from "@nestjs/config";
import { CreateUserInterface, UserBody, UserStatus } from "./user.types";
import { User } from "./user.entity";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Response } from 'express';
import { UserRoleName } from "src/userRole/userRole.types";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('users')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private configService: ConfigService
	) { }

	@UseGuards(JwtAuthGuard)
	@Get('info')
	getUserInfo(
		@Request()
		{ user }
	) {
		return this.userService.findById(user.id)
	}

	@Get()
	findAll() {
		return this.userService.findAll()
	}

	@Get('shop/:id')
	async findAllByShop(
		@Param("id")
		id: string,
		@Res()
		res: Response
	) {
		return this.userService.findAllByStorageId(id, res)
	}

	@Get('shop/letter/:id')
	async findAllByShopLetter(
		@Param("id")
		id: string,
		@Res()
		res: Response
	) {
		return this.userService.findAllByUsersCodeExists(id, res)
	}


	@Post()
	async createUser(@Body() body: CreateUserInterface): Promise<User> {
		return await this.userService.createUser(body)
	}

	@UseGuards(JwtAuthGuard)
	@Post('confirm/:code')
	async confirmUserEmail(
		@Param('code')
		code: string,
		@Request()
		{ user }
	) {
		return await this.userService.confirmUserEmail(user.id, code)
	}

	@UseGuards(JwtAuthGuard)
	@Post("update/email/:email")
	async registerNewEmail(
		@Param('email')
		email: string,
		@Request()
		{ user }
	) {
		return await this.userService.registerNewUserEmail(user.id, email)
	}

	@Get('/test')
	async test() {
		return await this.userService.findUsersByRole(UserRoleName.USER, [UserStatus.ACTIVE, UserStatus.ON_CHECK])
	}

	@Post("super-admin")
	async createNewSuperAdmin(
		@Body() user: UserBody
	) {
		return await this.userService.createSuperAdmin(user)
	}

	@Post('add')
	@UseInterceptors(FileInterceptor('file'))
	async addNewUsersToFirstShop(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
		const data = await this.userService.addUsersToFirstShop(file.buffer)
		res.json(data)
	}
}
