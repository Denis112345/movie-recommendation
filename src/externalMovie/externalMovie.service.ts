import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from "axios";
import { MovieDTO } from "../movie/dto/movie.dto"
import { MovieRequestCreateDTO } from "src/movie/dto/movie.createDto";
import { MovieExternalDTO, MovieExternalSchema } from "./dto/movie.externalDto";
import { ExternalMovieListDTO, ExternalMovieListSchema } from "./dto/movie.externalListDto";
import axios from "axios"
import type { AxiosInstance } from "axios";

@Injectable()
export class ExternalMovieService {
    private readonly client: AxiosInstance;

    constructor(
        private readonly config: ConfigService
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
        const response: AxiosResponse<ExternalMovieListDTO> = await this.client.get('films', {
            params: {
                keyword: title,
            }
        })

        return ExternalMovieListSchema.parse(response.data)
    }

    async getMovieInfo(dto: MovieRequestCreateDTO): Promise<MovieDTO> {
        const external_movie_id: number = (await this.getMoviesByTitle(dto.title)).items[0].kinopoiskId
        
        let response: AxiosResponse<MovieExternalDTO> = await this.client.get(`films/${external_movie_id}`)

        const external_movie: MovieExternalDTO = MovieExternalSchema.parse(response.data)

        const movie: MovieDTO = {
            title: external_movie.title,
            description: external_movie.description,
            releaseYear: external_movie.year,
            genres: external_movie.genres
        }

        return movie
    }
}