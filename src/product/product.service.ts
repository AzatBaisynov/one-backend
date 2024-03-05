import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./product.entity";
import { Repository } from "typeorm";
import * as ExcelJS from 'exceljs';
import { UserService } from "src/user/user.service";
import { ProductStatus } from "./product.types";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ProductService {
	constructor(
		@InjectRepository(Product)
		private productRepository: Repository<Product>,
		private readonly userService: UserService
	) {}

	async findById(id: string): Promise<Product> {
		return this.productRepository.findOne({
			where: {
				id
			}
		})
	}

	async findProductByHatch(hatch: string) {
		return this.productRepository.findOne({
			where: {
				hatch
			}
		})
	}

	async findAll(): Promise<Product[]> {
		return this.productRepository.find()
	}

	async uploadCnExcelPartOne(buffer: Buffer): Promise<any> {
		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(buffer);
		const worksheet = workbook.getWorksheet(1);

		const rows = []

		worksheet.eachRow((row, rowNumber) => {
			rows.push(row.values);
		});

		for (let i = 0; i < rows.length; i++) {
			const [ ,hatch ] = rows[i]
			console.log(rows[i])
			try {
				const product = await this.productRepository.save({ hatch: String(hatch).replaceAll("[","").replaceAll("]","").replaceAll(" ", ""), status: ProductStatus.IN_STORAGE})
				console.log(product)
				console.log("--------------")
			}
			catch(err) { 
				console.log(err) 
				continue;
			}
		}
	}

	async uploadKgExcelPartOne(buffer: Buffer): Promise<any> {
		const workbook = new ExcelJS.Workbook()
		await workbook.xlsx.load(buffer);
		const worksheet = workbook.getWorksheet(1);

		const rows = []

		worksheet.eachRow((row, rowNumber) => {
			rows.push(row.values)
		})

		for (let i = 0; i < rows.length; i++) {
			const [ ,hatch] = rows[i]
			try {
			const product = await this.productRepository.update({ hatch: String(hatch).replaceAll("[","").replaceAll("]","").replaceAll(" ", "") }, { status: ProductStatus.DELIVERED })
			console.log(product)
			console.log("-----------------")
			} catch(err) {
			console.log(err)
			continue
			}
		}
	}

	@Cron(CronExpression.EVERY_HOUR)
	async updateStatuses() {
		const twelveHoursAgo = new Date(Date.now() - 12 * 3600 * 1000);
		await this.productRepository
			.createQueryBuilder()
			.update(Product)
			.set({ status: ProductStatus.ON_THE_WAY })
			.where('dateCreated <= :twelveHoursAgo', { twelveHoursAgo })
			.andWhere('status != :delivered', { delivered: ProductStatus.DELIVERED })
			.andWhere('status != :onTheWay', { onTheWay: ProductStatus.ON_THE_WAY })
			.execute()
	}
}