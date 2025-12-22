import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { User } from "./entitys/user.entity";
import { UserService } from "./user.service";
import { AuthGuard } from "src/auth/guards/auth.guard";


@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ){}

    @Get('list')
    async userList(): Promise<User[]> {
        return await this.userService.findAll();
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async userProfle(@Param('id') id: number): Promise<User | null> {
        return await this.userService.findById(id)
    }
}