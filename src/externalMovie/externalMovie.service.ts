import { BadRequestException, Injectable, Query } from "@nestjs/common";
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from "axios";
import { MovieDTO } from "../movie/dto/movie.dto"
import { MovieRequestCreateDTO } from "src/movie/dto/movie.createDto";
import { MovieExternalDTO, MovieExternalPaginateDTO } from "./dto/movie.externalDto";
import axios from "axios"
import type { AxiosInstance } from "axios";
import { GenreExternalListDTO } from "./dto/genre.externalListDto";
import { GenreDTO, GenreSchema } from "../movie/dto/genre.dto";
import { GenreExternalDTO } from "./dto/genre.externalDto";

@Injectable()
export class ExternalMovieService {
    private readonly client: AxiosInstance;

    constructor(
        private readonly config: ConfigService
    ){
        this.client = axios.create({
            baseURL: 'https://api.themoviedb.org/3',
            headers: {
                Authorization: `Bearer ${this.config.get('external_movie_api_token')}`
            }
        });
    }


    async getMovieInfo(dto: MovieRequestCreateDTO): Promise<MovieDTO> {
        let response: AxiosResponse<MovieExternalPaginateDTO> = await this.client.get('/search/movie', {
            params: {
                query: dto.title,
                language: 'ru-RU'
            }
        })
        
        const external_movie: MovieExternalDTO = response.data.results[0]

        const movie: MovieDTO = {
            title: external_movie.original_title,
            description: external_movie.overview,
            releaseYear: parseInt(external_movie.release_date.split('-')[0]),
            genres: await Promise.all(external_movie.genre_ids.map(
                (genre_id) => {
                    return this.getGenreInfoByID(genre_id)
                }
            ))
        }

        return movie
    }

    async getGenreInfoByID(id: number): Promise<GenreDTO> {
        let response: AxiosResponse<GenreExternalListDTO> = await this.client.get('/genre/movie/list')
        const genre_list: GenreExternalListDTO = response.data

        const current_genre: GenreExternalDTO | undefined = genre_list.genres.find((genre) => genre.id == id)

        if (!current_genre) throw new BadRequestException('Жанр с таким id не найден')

        return GenreSchema.parse({
            title: current_genre.name
        })
    } 
}