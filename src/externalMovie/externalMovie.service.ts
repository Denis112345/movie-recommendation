import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios"
import { firstValueFrom, retry } from "rxjs";
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from "axios";
import { MovieDTO, MovieSchema } from "./dto/movie.dto"
import { MovieCreateDTO } from "src/movie/dto/movie.createDto";
import { MovieExternalPaginateDTO } from "./dto/movie.externalDto";

@Injectable()
export class ExternalMovieService {
    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService
    ){}

    async getMovieInfo(dto: MovieCreateDTO): Promise<MovieDTO> {
        let response: AxiosResponse<MovieExternalPaginateDTO> = await firstValueFrom(
            this.httpService.get('https://api.themoviedb.org/3/search/movie', {
                params: {
                    query: dto.title
                },
                headers: {
                    'Authorization': `Bearer ${this.config.get('external_movie_api_token')}`
                }
            })
        )

        return MovieSchema.parse(response.data.results[0])
    }

}