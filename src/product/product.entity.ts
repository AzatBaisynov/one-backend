import { User } from "src/user/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { ProductStatus } from "./product.types";
import { BaseEntity } from "src/base.entity";

@Entity()
export class Product extends BaseEntity {
	@Column({
		nullable: false,
		unique: true
	})
	hatch: string

	@Column({
		nullable: false
	})
	status: ProductStatus
}