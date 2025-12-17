import { BadRequestException, Injectable, Inject } from "@nestjs/common";
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from "axios";
import { MovieRequestCreateDTO } from "src/movie/dto/movie.createDto";
import { MovieExternalDTO, MovieExternalSchema } from "./dto/movie.externalDto";
import { ExternalMovieListDTO, ExternalMovieListSchema } from "./dto/movie.externalListDto";
import axios from "axios"
import type { AxiosInstance } from "axios";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

@Injectable()
export class ExternalMovieService {
    private readonly client: AxiosInstance;

    constructor(
        private readonly config: ConfigService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ){
        this.client = axios.create({
            baseURL: 'https://kinopoiskapiunofficial.tech/api/v2.2',
            headers: {
                'X-API-KEY': this.config.get('external_movie_api_token'),
                accept: 'application/json'
            }
        });
    }

    async getMoviesByTitle(title: string): Promise<ExternalMovieListDTO> {
        const cache_key = `movies-by-title:${title}`
        const cached = await this.cacheManager.get(cache_key)

        if (cached) {
            console.log('return from cache')
            return cached as ExternalMovieListDTO
        }

        const response: AxiosResponse<ExternalMovieListDTO> = await this.client.get('films', {
            params: {
                keyword: title,
            }
        })

        const parsedData = ExternalMovieListSchema.parse(response.data)
        await this.cacheManager.set(cache_key, parsedData)

        return parsedData
    }
    
    async getMovieByID(id: number): Promise<MovieExternalDTO> {
        const cache_key = `movie:${id}`
        const cached = await this.cacheManager.get(cache_key)

        if (cached) {
            console.log('return from cache')
            return cached as MovieExternalDTO
        }

        let response: AxiosResponse<MovieExternalDTO> = await this.client.get(`films/${id}`)

        if (!response.data) throw new BadRequestException('Фильма с таким ID нет')
        
        await this.cacheManager.set(cache_key, response.data)

        return response.data
    }

    async getMovieByTitle(dto: MovieRequestCreateDTO): Promise<MovieExternalDTO> {
        const external_movie_id: number = (await this.getMoviesByTitle(dto.title)).items[0].kinopoiskId
        return await this.getMovieByID(external_movie_id)
    }
    async getPopularMovies(): Promise<MovieExternalDTO[]> {
        const cache_key = 'movie-popular'
        const cached = await this.cacheManager.get(cache_key)

        if (cached) {
            return cached as MovieExternalDTO[]
        }
        const response: AxiosResponse<ExternalMovieListDTO> = await this.client.get('films', {
            params: {
                order: "RATING",
                page: 1
            }
        })

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        const movies_list: MovieExternalDTO[] = [];

        for (const movie of response.data.items) {
            const data = await this.getMovieByID(movie.kinopoiskId);
            movies_list.push(data);
            await delay(150);
        }

        await this.cacheManager.set(cache_key, movies_list)

        return movies_list
    }
}