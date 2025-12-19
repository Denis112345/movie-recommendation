import { Injectable } from "@nestjs/common";
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
}