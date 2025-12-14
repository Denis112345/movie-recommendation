import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ExternalMovieService } from "./externalMovie.service";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [ExternalMovieService],
    exports: [ExternalMovieService]
})
export class ExternalMoovieApp {}