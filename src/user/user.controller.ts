import { Controller, Get } from "@nestjs/common";
import { User } from "./entitys/user.entity";
import { UserService } from "./user.service";


@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ){}

    @Get('list')
    index(): Promise<User[]> {
        return this.userService.findAll();
    }
}