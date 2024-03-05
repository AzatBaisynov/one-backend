import { Controller, Get, Param } from '@nestjs/common'
import { StorageService } from "./storage.service"

@Controller('storage')
export class StorageController {
	constructor(
		private readonly storageService: StorageService
	) {}
	@Get('all')
	async getAll() {
		return this.storageService.findAll()
	}

	@Get('active/:id')
	async setActive(
		@Param("id")
		id: string
	) {
		console.log(id)
		return this.storageService.setActiveStorage(id)
	}
	
	@Get('add')
	async newStore() {
		return this.storageService.newStore()
	}
}