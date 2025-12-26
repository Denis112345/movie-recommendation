import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Movie, MovieCreationAttribute } from "./entitys/movie.entity";
import { MovieRequestCreateDTO } from "./dto/movie.createDto";
import { ExternalMovieService } from "src/externalMovie/externalMovie.service";
import { MovieDTO } from "./dto/movie.dto";
import { GenreDTO, GenreSchema } from "./dto/genre.dto";
import { Genre, GenreCreationAttributes } from "./entitys/genre.entity";
import { MovieExternalDTO } from "src/externalMovie/dto/movie.externalDto"
import { Raiting } from "src/raiting/entitys/raiting.entity";
import { Sequelize } from "sequelize";


@Injectable()
export class MovieService {
    constructor(
        @InjectModel(Movie)
        private movieRepo: typeof Movie,
        @InjectModel(Genre)
        private genreRepo: typeof Genre,
        private externalMovie: ExternalMovieService,
    ){}

    async movieExists(title: string): Promise<Boolean> {
        const movie: Movie | null = await this.movieRepo.findOne({ where: { title: title } })
        if (movie) return true
        return false
    }

    async create(dto: MovieRequestCreateDTO): Promise<Movie> {
        const external_movie: MovieExternalDTO = await this.externalMovie.getMovieByTitle(dto)
        const movie: MovieDTO = {
            title: external_movie.title,
            description: external_movie.description,
            releaseYear: external_movie.year,
            genres: external_movie.genres,
            ratingImdb: external_movie.ratingImdb
        }
        const new_genres: Genre[] = await Promise.all(
            movie.genres.map(async (genre) => {
                return await this.createGenre(GenreSchema.parse(genre))
            })
        )

        if (await this.movieExists(movie.title)) {
            throw new BadRequestException('Такой фильм уже есть')
        }

        const new_movie = await this.movieRepo.create({
            title: movie.title,
            description: movie.description,
            releaseYear: movie.releaseYear
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

    async getAllMovies(): Promise<Movie[]> {
        return await this.movieRepo.findAll({
            include: {
                model: Genre,
                through: { attributes: [] }
            }
        })
    }

    async getBestMovies(limit: number): Promise<Movie[]> {
        return await this.movieRepo.findAll({
            attributes: {
                include: [
                    [Sequelize.fn('AVG', Sequelize.col('Raitings.raiting')), 'avg_raiting']
                ]
            },
            include: [{
                model: Raiting,
                attributes: []
            }],
            group: ['Movie.id'],
            order: [[Sequelize.literal('avg_raiting'), 'DESC']],
            limit: limit,
            subQuery: false
        })
    }

    async getMovie(id: number): Promise<Movie> {
        const movie: Movie | null = await this.movieRepo.findOne({
            where: {id: id},
            include: [
                {
                    model: Genre,
                    through: { attributes: [] }
                },
                {
                    model: Raiting,
                    required: false
                }
            ],
        })
        if (!movie) throw new BadRequestException('Фильма с таким id нет')
        return movie
    }

    async getAvgMovieRaiting(movie_id: number): Promise<number> {
        const movie: Movie = await this.getMovie(movie_id)

        const raitings = movie.Raitings || []
        
        if (!Array.isArray(raitings) || raitings.length === 0) {
            return 0
        }

        const raiting_numbers: number[] = raitings.map((raiting_obj) => raiting_obj.raiting)
        const avarage: number = raiting_numbers.reduce((sum, num) => sum + num, 0) / raiting_numbers.length

        return avarage
    }

    // async getFavoriteMovies(user_id: number): Promise<Movie[]> {
    //     this.movieRepo.findAll({where: {
                
    //     }})
    // }
}