import { Injectable } from '@nestjs/common'
import { Repository } from "typeorm";
import { Storage } from "./storage.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class StorageService {
	constructor(
		@InjectRepository(Storage)
		private storageRepository: Repository<Storage>
	) { }

	onApplicationBootstrap() {
		// this.createStorages()
	}

	async newStore() {
		await this.storageRepository.save({
			isActive: false,
			phone: "15147091119",
			address1: "·广东省广州市白云区江高镇",
			address2: "·南岗三元南路62号安托仓储1119-燃<U_CODE>库房",
		})
	}

	async createStorages() {
		const storages = await this.findAll()
		if (storages.length !== 2 && storages.length < 3) {
			await this.storageRepository.save({
				isActive: false,
				phone: "15147091119",
				address1: "广东省广州市白云区江高镇",
				address2: "南岗三元南路62号安托仓储1119- 际E-ваш код库房",
			})
			await this.storageRepository.save({
				isActive: false,
				phone: "13899490742",
				address1: "·广东省广州市白云区",
				address2: "·广州市白云区太和镇田心桂香街北三巷18号101 (U- ваш код)",
			})
			
		}
	}

	async findById(id: string): Promise<Storage> {
		return this.storageRepository.findOne({
			where: {
				id
			}
		})
	}

	async findAll(): Promise<Storage[]> {
		return await this.storageRepository.find()
	}

	async setActiveStorage(id: string): Promise<void> {
		const allStorages = await this.findAll()
		for (let i = 0; i < allStorages.length; i++) {
			await this.storageRepository.update(allStorages[i].id, {
				isActive: allStorages[i].id === id
			})
		}
	}

	async getActiveStorage(): Promise<Storage> {
		return await this.storageRepository.findOneBy({
			isActive: true
		})
	}
}