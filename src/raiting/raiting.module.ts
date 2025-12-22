import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Raiting } from "./entitys/raiting.entity";
import { RaitingController } from "./raiting.controller";
import { RaitingService } from "./raiting.service";

@Module({
    providers: [RaitingService],
    controllers: [RaitingController],
    exports: [RaitingService],
    imports: [SequelizeModule.forFeature([Raiting])],
})
export class RaitingApp {}