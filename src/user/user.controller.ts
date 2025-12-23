import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { User } from "./entitys/user.entity";
import { UserService } from "./user.service";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { Movie } from "src/movie/entitys/movie.entity";


@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ){}

    @Get('list')
    async userList(): Promise<User[]> {
        return await this.userService.findAll();
    }

    @Get(':id')
    async userProfle(@Param('id') id: number): Promise<User | null> {
        return await this.userService.findById(id)
    }

    @Get(':id/recommendations')
    async getUserRecommendations(@Param('id') id: number) {
        return await this.userService.getUserRecommendations(id)
    }
}