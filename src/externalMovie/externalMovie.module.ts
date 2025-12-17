import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ExternalMovieService } from "./externalMovie.service";
import { ConfigModule } from "@nestjs/config";
import { ExternalMoviesController } from "./externalMovie.controller"

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [ExternalMovieService],
    exports: [ExternalMovieService],
    controllers: [ExternalMoviesController]
})
export class ExternalMovieApp {}