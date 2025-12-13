import { Controller, Get, Param, Post } from "@nestjs/common";


@Controller('movies')
export class MovieController {
    @Get()
    getAllMovies() {
        return []
    }

    @Get('popular')
    getPopularMovies() {
        return []
    }

    @Get(':id')
    getMivie(@Param('id') id: number) {
        return []
    }

    @Post()
    addMovie() {
        return []
    }
} 