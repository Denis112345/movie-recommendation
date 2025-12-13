import { Body, Controller, Get, Param, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { MovieCreateSchema } from "./dto/movie.createDto";
import type { MovieCreateDTO } from "./dto/movie.createDto";
import { MovieService } from "./movie.service";


@Controller('movies')
export class MovieController {
    constructor(
        private readonly movieService: MovieService
    ){}
    @Get()
    getAllMovies() {
        return []
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
    @UsePipes(new ZodValidationPipe(MovieCreateSchema))
    addMovie(@Body() dto: MovieCreateDTO) {
        return this.movieService.create(dto)
    }
} 