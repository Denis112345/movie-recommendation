import { Body, Controller, Get, Param, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { MovieRequestCreateSchema } from "./dto/movie.createDto";
import type { MovieRequestCreateDTO } from "./dto/movie.createDto";
import { MovieService } from "./movie.service";


@Controller('movies')
export class MovieController {
    constructor(
        private readonly movieService: MovieService
    ){}
    
    @Get()
    async getAllMovies() {
        return await this.movieService.getAllMovies()
    }

    @Get('popular')
    getPopularMovies() {
        return []
    }

    @Get(':id')
    getMovie(@Param('id') id: number) {
        return []
    }

    @Post()
    @UsePipes(new ZodValidationPipe(MovieRequestCreateSchema))
    addMovie(@Body() dto: MovieRequestCreateDTO) {
        return this.movieService.create(dto)
    }
} 