import { BadRequestException, Injectable } from "@nestjs/common";
import { Raiting, RaitingCreationAttributes } from "./entitys/raiting.entity";
import { RaitingDTO } from "./dto/raiting.dto";
import { InjectModel } from "@nestjs/sequelize";


@Injectable()
export class RaitingService {
    constructor(
        @InjectModel(Raiting)
        private readonly raitingRepo: typeof Raiting
    ){}

    async createRaiting(dto: RaitingDTO): Promise<Raiting> {
        return await this.raitingRepo.create(dto as RaitingCreationAttributes)
    }

    async getRaitingByID(id: number): Promise<Raiting> {
        const raiting: Raiting | null = await this.raitingRepo.findOne({ where: {id: id} })
        if (!raiting) throw new BadRequestException('Рейтинга с таким ID нет')
        return raiting
    }
}