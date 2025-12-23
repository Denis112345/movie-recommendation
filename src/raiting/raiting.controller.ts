import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { RaitingSchema } from "./dto/raiting.dto";
import type { RaitingDTO } from "./dto/raiting.dto";
import { RaitingService } from "./raiting.service";


@Controller('raiting')
export class RaitingController {
    constructor(
        private readonly raitingService: RaitingService
    ){}
    @Post()
    @UsePipes(new ZodValidationPipe(RaitingSchema))
    async addRaitingToMovie(@Body() dto: RaitingDTO) {
        return this.raitingService.createRaiting(dto)
    } 
}