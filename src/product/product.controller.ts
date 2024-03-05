import { Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";

@Controller("product")
export class ProductController {
	constructor(
		private readonly productService: ProductService
	) {}

	@Post('add/cn/1')
	@UseInterceptors(FileInterceptor('file'))
	async addProductsToDB(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
		const data = await this.productService.uploadCnExcelPartOne(file.buffer);
		res.json(data)
	}

	@Post('add/kg/1')
	@UseInterceptors(FileInterceptor('file'))
	async updateStatuses(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
		const data = await this.productService.uploadKgExcelPartOne(file.buffer);
		res.json(data)
	}

	@Get('hatch/:hatch')
	async getProductByHatch(
		@Param('hatch')
		hatch: string,
	) {
		return this.productService.findProductByHatch(hatch);
	}
}