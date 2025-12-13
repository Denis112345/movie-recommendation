import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Movie } from "./entitys/movie.entity";
import { MovieCreateDTO } from "./dto/movie.createDto";
import { ExternalMovieService } from "src/externalMovie/externalMovie.service";
import { MovieDTO } from "src/externalMovie/dto/movie.dto";


@Injectable()
export class MovieService {
    constructor(
        @InjectModel(Movie)
        private movieRepo: typeof Movie,
        private externalMovie: ExternalMovieService
    ){}

    async create(dto: MovieCreateDTO): Promise<MovieDTO> {
        let info: MovieDTO = await this.externalMovie.getMovieInfo(dto)
        return info
    }
}