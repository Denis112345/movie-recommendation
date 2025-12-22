import { BadRequestException, Body, Controller, Get, Param, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { MovieRequestCreateSchema } from "./dto/movie.createDto";
import type { MovieRequestCreateDTO } from "./dto/movie.createDto";
import { MovieService } from "./movie.service";
import { PositiveIntPipe } from "./pipes/movie.positiveIntPipe";
import { Movie } from "./entitys/movie.entity";


@Controller('movies')
export class MovieController {
    constructor(
        private readonly movieService: MovieService
    ){}
    
    @Get()
    async getAllMovies() {
        return await this.movieService.getAllMovies()
    }

    @Get(':id')
    async getMovie(@Param('id') id: number) {
        return await this.movieService.getMovie(id)
    }

    @Post()
    @UsePipes(new ZodValidationPipe(MovieRequestCreateSchema))
    async addMovie(@Body() dto: MovieRequestCreateDTO) {
        return await this.movieService.create(dto)
    }

    @Get(':id/raiting')
    async getMovieRaiting(@Param('id', PositiveIntPipe) id: number): Promise<number> {
        return await this.movieService.getAvgMovieRaiting(id)
    }
} 