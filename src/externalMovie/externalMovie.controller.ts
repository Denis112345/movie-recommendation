import { Controller, Get } from "@nestjs/common";
import { ExternalMovieService } from "./externalMovie.service";


@Controller('external-movies')
export class ExternalMoviesController {
    constructor(
        private readonly externalMovieService: ExternalMovieService
    ){}

    @Get('popular')
    async getPopularMovies() {
        return await this.externalMovieService.getPopularMovies()
    }
}