import { BaseEntity } from "src/base.entity";
import { User } from "src/user/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Storage extends BaseEntity {
	@Column({
		nullable: false
	})
	address1: string
	@Column({
		nullable: false
	})
	address2: string

	@Column({
		nullable: false
	})
	phone: string

	@Column({
		nullable: false,
		default: false
	})
	isActive: boolean

}