import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Movie, MovieCreationAttribute } from "./entitys/movie.entity";
import { MovieRequestCreateDTO } from "./dto/movie.createDto";
import { ExternalMovieService } from "src/externalMovie/externalMovie.service";
import { MovieDTO } from "./dto/movie.dto";
import { GenreDTO, GenreSchema } from "./dto/genre.dto";
import { Genre, GenreCreationAttributes } from "./entitys/genre.entity";


@Injectable()
export class MovieService {
    constructor(
        @InjectModel(Movie)
        private movieRepo: typeof Movie,
        @InjectModel(Genre)
        private genreRepo: typeof Genre,
        private externalMovie: ExternalMovieService
    ){}

    async create(dto: MovieRequestCreateDTO): Promise<Movie> {
        const external_movie: MovieDTO = await this.externalMovie.getMovieInfo(dto)
        
        const new_genres: Genre[] = await Promise.all(
            external_movie.genres.map(async (genre) => {
                return await this.createGenre(GenreSchema.parse(genre))
            })
        )
        const new_movie = await this.movieRepo.create({
            title: external_movie.title,
            description: external_movie.description,
            releaseYear: external_movie.releaseYear
        } as MovieCreationAttribute)

        new_movie.$set('genres', new_genres)

        return new_movie
    }

    async createGenre(dto: GenreDTO): Promise<Genre> {
        let genre = await this.genreRepo.findOne({where: {title: dto.title}})
        if (!genre) {
            genre = await this.genreRepo.create(dto as GenreCreationAttributes)
        }
        return genre
    }
}