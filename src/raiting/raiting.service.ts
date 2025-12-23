import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Raiting, RaitingCreationAttributes } from "./entitys/raiting.entity";
import { RaitingDTO } from "./dto/raiting.dto";
import { InjectModel } from "@nestjs/sequelize";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";


@Injectable()
export class RaitingService {
    constructor(
        @InjectModel(Raiting)
        private readonly raitingRepo: typeof Raiting,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
        
    ){}

    async createRaiting(dto: RaitingDTO): Promise<Raiting> {
        this.cacheManager.del(`user_rec:${dto.user_id}`)
        return await this.raitingRepo.create(dto as RaitingCreationAttributes)
    }

    async getRaitingByID(id: number): Promise<Raiting> {
        const raiting: Raiting | null = await this.raitingRepo.findOne({ where: {id: id} })
        if (!raiting) throw new BadRequestException('Рейтинга с таким ID нет')
        return raiting
    }
}