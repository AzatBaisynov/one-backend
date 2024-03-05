import { BaseEntity } from "src/base.entity";
import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { UserInterface, UserStatus } from "./user.types";
import { hash } from "bcrypt";
import { Confirmation } from "src/confirmation/confirmation.entity";
import { UserRole } from "src/userRole/userRole.entity";
import { Storage } from "src/storage/storage.entity";

@Entity()
export class User extends BaseEntity implements UserInterface {
	@Column({
		nullable: false
	})
	name: string

	@Column({
		nullable: false
	})
	surname: string

	@Column({
		unique: true
	})
	personal_code: string

	@Column({
		nullable: false
	})
	phone: string

	@Column({
		nullable: false
	})
	dateOfBirth: string

	@Column({
		nullable: false
	})
	residenceCity: string

	@Column({
		nullable: true,
		unique: true
	})
	email: string

	@Column({
		nullable: false
	})
	password: string

	@Column({
		nullable: false
	})
	status: UserStatus

	@ManyToMany(() => UserRole)
	@JoinTable()
	roles: UserRole[]

	@ManyToOne(() => Confirmation)
	emailConfirmation: Confirmation

	@ManyToOne(() => Storage)
	storage: Storage

	@BeforeInsert()
	async hashPassword() {
		this.password = await hash(this.password, 10)
	}
}