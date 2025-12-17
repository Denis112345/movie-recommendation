import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from "axios";
import { MovieDTO } from "../movie/dto/movie.dto"
import { MovieRequestCreateDTO } from "src/movie/dto/movie.createDto";
import { MovieExternalDTO, MovieExternalSchema } from "./dto/movie.externalDto";
import axios from "axios"
import type { AxiosInstance } from "axios";

@Injectable()
export class ExternalMovieService {
    private readonly client: AxiosInstance;

    constructor(
        private readonly config: ConfigService
    ){
        this.client = axios.create({
            baseURL: 'http://www.omdbapi.com/',
            params: {
                apikey: this.config.get('external_movie_api_token')
            }
        });
    }

    async getMovieInfo(dto: MovieRequestCreateDTO): Promise<MovieDTO> {
        let response: AxiosResponse<MovieExternalDTO> = await this.client.get('', {
            params: {
                t: dto.title,
            }
        })
        
        const external_movie: MovieExternalDTO = MovieExternalSchema.parse(response.data)
        console.log(typeof external_movie.Genre)
        const movie: MovieDTO = {
            title: external_movie.Title,
            description: external_movie.Plot,
            releaseYear: parseInt(external_movie.Year),
            genres: external_movie.Genre.map((genre_title) => ({
                    title: genre_title   
                })
            )
        }

        return movie
    }
}