import { Module } from "@nestjs/common";
import { ExternalMoovieApp } from "src/externalMovie/externalMovie.module";
import { MovieService } from "./movie.service";
import { MovieController } from "./movie.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { Movie } from "./entitys/movie.entity";


@Module({
    imports: [
        ExternalMoovieApp,
        SequelizeModule.forFeature([Movie])
    ],
    providers: [MovieService],
    exports: [MovieService],
    controllers: [MovieController]
})
export class MovieApp{}