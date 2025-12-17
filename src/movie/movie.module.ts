import { Module } from "@nestjs/common";
import { ExternalMovieApp } from "src/externalMovie/externalMovie.module";
import { MovieService } from "./movie.service";
import { MovieController } from "./movie.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { Movie } from "./entitys/movie.entity";
import { Genre } from "./entitys/genre.entity";


@Module({
    imports: [
        ExternalMovieApp,
        SequelizeModule.forFeature([Movie, Genre]),
    ],
    providers: [MovieService],
    exports: [MovieService],
    controllers: [MovieController]
})
export class MovieApp{}