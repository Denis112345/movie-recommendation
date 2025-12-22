import { BadRequestException, Body, Controller, Get, Inject, Param, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { MovieRequestCreateSchema } from "./dto/movie.createDto";
import type { MovieRequestCreateDTO } from "./dto/movie.createDto";
import { MovieService } from "./movie.service";
import { PositiveIntPipe } from "./pipes/movie.positiveIntPipe";
import { Movie } from "./entitys/movie.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

@Controller('movies')
export class MovieController {
    constructor(
        private readonly movieService: MovieService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
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
        const cache_key: string = `movie_raiting_avg:${id}`
        const cached: number | undefined = await this.cacheManager.get(cache_key)
        if (cached) return cached
        
        const avarage: number = await this.movieService.getAvgMovieRaiting(id)

        this.cacheManager.set(cache_key, avarage, 30000)
        
        return await avarage
    }
} 