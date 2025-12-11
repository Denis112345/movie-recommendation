import { Body, Controller, Get, Inject, Post, UsePipes } from "@nestjs/common";
import { User } from "./entitys/user.entity";
import { UserService } from "./user.service";
import { UserCreateSchema, type UserCreateDTO } from "./dto/user.createDto";
import { ZodValidationPipe } from 'nestjs-zod'


@Controller('user')
export class UserController {
    constructor(
        @Inject('USERS_REPOSITORY')
        private readonly userService: UserService
    ){}

    @Get('list')
    index(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Post()
    @UsePipes(new ZodValidationPipe(UserCreateSchema))
    createUser(@Body() dto: UserCreateDTO): Promise<User> {
        return this.userService.create(dto);
    }
}