import { Controller, Get } from "@nestjs/common";


@Controller('external-movies')
export class ExternalMoviesController {
    constructor(){}

    @Get()
    getPopulatMovies() {
        
    }
}