import { Injectable, HttpStatus, HttpException, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateUserInterface, UserBody, UserStatus } from "./user.types";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { ConfirmationService } from "src/confirmation/confirmation.service";
import { MailerService } from "@nestjs-modules/mailer/dist";
import { ConfirmationStatus } from "src/confirmation/confirmation.types";
import { UserRoleService } from "src/userRole/userRole.service";
import { UserRoleName } from "src/userRole/userRole.types";
import { UserRole } from "src/userRole/userRole.entity";
import { hash } from "bcrypt";
import { StorageService } from "src/storage/storage.service";
import * as ExcelJS from 'exceljs';
import { Response } from "express";

@Injectable()
export class UserService {
	constructor(
		private readonly confirmationService: ConfirmationService,
		private configService: ConfigService,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private readonly mailerService: MailerService,
		private readonly userRoleService: UserRoleService,
		private readonly storageService: StorageService,
	) { }


	onApplicationBootstrap() {
		// this.createAdm()
	}

	async createAdm() {
		const exist = await this.userRepository.findOne({
			where: {
				personal_code: "U000"
			}
		})
		if (!exist) {
			const user = new User();
			user.personal_code = "U000";
			user.name = "admin";
			user.surname = "admin";
			user.phone = "+9";
			user.email = "admin";
			user.dateOfBirth = new Date().toDateString();
			user.residenceCity = "Bishkek";
			user.status = UserStatus.ACTIVE;
			user.password = "Asiali19B"
			this.userRepository.save(user)
		}
	}


	findAll() {
		return [{ id: 1, name: "Max" }]
	}

	async findUsersByRole(roleName: UserRoleName, statuses: UserStatus[]): Promise<User[]> {
		return this.userRepository
			.createQueryBuilder('user')
			.innerJoinAndSelect('user.roles', 'user_role', 'user_role.roleName = :roleName AND user.status in (:...statuses)', { roleName, statuses })
			.getMany()
	}

	async findById(id: string): Promise<User | null> {
		return await this.userRepository.findOne({
			where: {
				id
			},
			relations: {
				emailConfirmation: true,
				storage: true
			}
		})
	}

	async addUsersToFirstShop(buffer: Buffer): Promise<any> {
		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(buffer);
		const worksheet = workbook.getWorksheet(1);


		const rows = []

		worksheet.eachRow((row, rowNumber) => {
			rows.push(row.values);
		});

		const storage = await this.storageService.findById("89858e75-391f-4650-aa25-981e711581ed");

		for (let i = 0; i < rows.length; i++) {
			const [, code, name, personal_code] = rows[i]
			const user = await this.userRepository.save({
				name: name,
				surname: "-",
				personal_code: code,
				phone: (typeof personal_code) === "string" ? personal_code : "-",
				dateOfBirth: "-",
				residenceCity: "-",
				email: code,
				password: "123456",
				status: UserStatus.ACTIVE,
				storage: storage,
			})
			console.log(user)
			
			// console.log(product) 
			console.log("--------------")
		}
	}

	async findAllByStorageId(id: string, res: Response) {
		const storages = await this.storageService.findAll()
		for (let i = 0; i < storages.length; i++) {
			if (storages[i].id === id) {
				console.log(id)
				console.log("TEST")
				const users = await this.userRepository.find({
					where: {
						storage: {
							id
						}
					}
				})
				const workbook = new ExcelJS.Workbook();
				const worksheet = workbook.addWorksheet('Users');

				worksheet.columns = [
					{ header: 'Personal Code', key: 'personal_code', width: 15 },
					{ header: 'Name', key: 'name', width: 10 },
					{ header: 'Surname', key: 'surname', width: 12 },
					{ header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
					{ header: 'Email', key: 'email', width: 25 },
					{ header: 'Phone', key: 'phone', width: 18 },
					{ header: 'Residence City', key: 'residenceCity', width: 20 },
					{ header: 'Date Created', key: 'dateCreated', width: 20 },
				];

				users.forEach((user) => {
					const { name, surname, personal_code, dateOfBirth, email, phone, residenceCity, dateCreated } = user
					worksheet.addRow({
						name, surname, personal_code, dateOfBirth, email, phone, residenceCity, dateCreated
					})
				})

				res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
				res.setHeader('Content-Disposition', `attachment; filename="users.xlsx"`);

				await workbook.xlsx.write(res);
				res.end();
			}
		}
		return null
	}

	async findAllByUsersCodeExists(letter: string, res: Response) {
		const storages = await this.userRepository.find()

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Users');

		worksheet.columns = [
			{ header: 'Personal Code', key: 'personal_code', width: 15 },
			{ header: 'Name', key: 'name', width: 10 },
			{ header: 'Surname', key: 'surname', width: 12 },
			{ header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
			{ header: 'Email', key: 'email', width: 25 },
			{ header: 'Phone', key: 'phone', width: 18 },
			{ header: 'Residence City', key: 'residenceCity', width: 20 },
			{ header: 'Date Created', key: 'dateCreated', width: 20 },
		];

		for (let i = 0; i < storages.length; i++) {
			if (storages[i].personal_code.includes(letter)) {
				console.log("TEST")
				

				
				const { name, surname, personal_code, dateOfBirth, email, phone, residenceCity, dateCreated } = storages[i]
				worksheet.addRow({
					name, surname, personal_code, dateOfBirth, email, phone, residenceCity, dateCreated
				})

			}
		}
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', `attachment; filename="users.xlsx"`);

		await workbook.xlsx.write(res);
		res.end();

		return null
	}


	async findAllByStorage(num: number) {
		const storages = await this.storageService.findAll()
		if (num === 1) {
			return this.userRepository.find({
				where: {
					storage: storages[0]
				}
			})
		} else {
			return this.userRepository.find({
				where: {
					storage: storages[1]
				}
			})
		}
	}

	async findByEmail(email: string): Promise<User> {
		return await this.userRepository.findOne({
			where: {
				email
			}
		})
	}

	async findByPersonalCode(personal_code: string): Promise<User> {
		return await this.userRepository.findOne({
			where: {
				personal_code
			},
			relations: {
				storage: true
			}
		})
	}

	private generateUser(body: UserBody): User {
		const user = new User();
		user.name = body.name;
		user.surname = body.surname;
		user.phone = body.phone;
		user.dateOfBirth = body.dateOfBirth;
		user.residenceCity = body.residenceCity;
		user.email = body.email.toLowerCase();
		user.status = UserStatus.ON_CHECK;
		return user
	}

	private async checkExistingRole(role: UserRoleName): Promise<UserRole> {
		const userRole = await this.userRoleService.findRoleByRoleName(role)

		if (!userRole) {
			throw new HttpException('User role doesnt exist', HttpStatus.INTERNAL_SERVER_ERROR)
		}

		return userRole
	}

	async createUser(body: CreateUserInterface): Promise<User> {
		const userRole = await this.checkExistingRole(body.role.roleName)
		const activeStorage = await this.storageService.getActiveStorage()

		const user = this.generateUser(body)
		user.password = body.password
		user.roles = [userRole]
		user.storage = activeStorage

		/* Сюда надо внедрить алгоритм создания personal_code*/
		const lastUser = await this.userRepository.find({
			order: { dateCreated: 'DESC' },
			take: 1
		});
		let newCode = 'A0001';
		if (lastUser[0] && lastUser[0].personal_code) {
			const { prefix, number } = this.splitCode(lastUser[0].personal_code);
			console.log(number)
			if (number < 9999) {
				newCode = `${prefix}${this.padNumber(number + 1)}`;
			} else {
				const nextPrefix = this.nextChar(prefix);
				newCode = `${nextPrefix}0001`;
			}
		}
		console.log(newCode)
		user.personal_code = newCode;
		/* Сюда надо внедрить алгоритм создания personal_code*/

		const emailConfirmation = await this.confirmationService.createEmailConfirmation();
		user.emailConfirmation = emailConfirmation
		const createdUser = await this.userRepository.save(user)
		// await this.mailerService.sendMail({
		// 	to: user.email,
		// 	from: this.configService.get<string>('EMAIL'),
		// 	subject: "Please confirm your email!",
		// 	text: `Your confirmation code is: ${emailConfirmation.code}`,
		// 	html: ""
		// })
		return createdUser
	}

	private splitCode(code: string): { prefix: string; number: number } {
		const match = code.match(/^([A-Z]+)(\d+)$/);
		if (!match) throw new InternalServerErrorException('Invalid code format.');

		return {
			prefix: match[1],
			number: parseInt(match[2], 10),
		};
	}

	private padNumber(num: number): string {
		return num.toString().padStart(4, '0');
	}

	private nextChar(c: string): string {
		const nextCharCode = c.charCodeAt(0) + 1;
		// Здесь вы можете добавить проверку, чтобы вернуться к 'A', если достигнут 'Z'
		return String.fromCharCode(nextCharCode);
	}

	async confirmUserEmail(userId: string, code: string) {
		const user = await this.findById(userId)
		const emailConfirmation = await this.confirmationService.confirmEmailConfirmation(code, user.emailConfirmation)
		switch (emailConfirmation.confirmationStatus) {
			case ConfirmationStatus.PENDING: {
				throw new HttpException(`Code is incorrect, you have ${emailConfirmation.attempts} attempts`, HttpStatus.NOT_ACCEPTABLE)
			}
			case ConfirmationStatus.DECLINED: {
				throw new HttpException('You dont have no attempts anymore, register new email', HttpStatus.NOT_ACCEPTABLE)
			}
			case ConfirmationStatus.ACTIVATED: {
				await this.userRepository.update(userId, { status: UserStatus.ACTIVE })
				return await this.findById(userId)
			}
		}
	}

	async registerNewUserEmail(userId: string, email: string) {
		const user = await this.findById(userId)
		if (user.status === UserStatus.DELETED || user.status === UserStatus.INACTIVE) {
			throw new HttpException("User is inactive or was deleted", HttpStatus.FORBIDDEN)
		}
		try {
			await this.confirmationService.closeConfirmation(user.emailConfirmation.id)
			const emailConfirmation = await this.confirmationService.createEmailConfirmation()
			await this.userRepository.update(user.id, { email, emailConfirmation })
			const updatedUser = await this.findById(user.id)
			await this.mailerService.sendMail({
				to: updatedUser.email,
				from: this.configService.get<string>('EMAIL'),
				subject: "Please confirm your email!",
				text: `Your confirmation code is: ${emailConfirmation.code}`,
				html: ""
			})
			return updatedUser
		} catch (err) {
			throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
		}
	}

	async createSuperAdmin(body: UserBody) {
		const superAdminRole = await this.checkExistingRole(UserRoleName.SUPER_ADMIN)

		const existingSuperAdmin = await this.findUsersByRole(UserRoleName.SUPER_ADMIN, [UserStatus.ON_CHECK, UserStatus.ACTIVE])

		if (existingSuperAdmin.length) {
			throw new HttpException("SuperAdmin User already exist", HttpStatus.FORBIDDEN)
		}

		const superAdmin = await this.generateUser(body)
		const randomPassword = (await hash(Math.random().toString(), 3)).slice(0, 8)
		superAdmin.password = randomPassword
		console.log("random pass: ", randomPassword)
		superAdmin.roles = [superAdminRole]

		const createdSuperAdmin = await this.userRepository.save(superAdmin)

		await this.mailerService.sendMail({
			to: superAdmin.email,
			from: this.configService.get<string>('EMAIL'),
			subject: "Please confirm your email!",
			text: `Your password is: ${randomPassword}, enter your password to activate your account`,
			html: ""
		})

		return createdSuperAdmin
	}

	/* TODO: Create method to change super admin email */
	async changeSuperAdminEmail() {

	}
	/* TODO *********************************************/

	/* TODO: Resend password to super admin email */
	async resendSuperAdminPassword() {

	}
	/* TODO ***************************************/

	async confirmSuperAdminAccountByPassword(userId: string) {
		await this.userRepository.update(userId, { status: UserStatus.ACTIVE })
		return this.findById(userId)
	}

}