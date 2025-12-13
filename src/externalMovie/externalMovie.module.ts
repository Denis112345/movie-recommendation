import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ExternalMovieService } from "./externalMovie.service";

@Module({
    imports: [HttpModule],
    providers: [ExternalMovieService],
    exports: [ExternalMovieService]
})
export class ExternalMoovieApp {}