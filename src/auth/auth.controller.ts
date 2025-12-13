import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { AuthCreateSchema } from "./dto/auth.createDto";
import type { AuthCreateDTO } from "./dto/auth.createDto";
import { User } from "src/user/entitys/user.entity";
import { UserService } from "src/user/user.service";


@Controller('auth')
export class AuthController {
    constructor(
        private readonly userService: UserService
    ){}

    @Post('register')
    @UsePipes(new ZodValidationPipe(AuthCreateSchema))
    createUser(@Body() dto: AuthCreateDTO): Promise<User> {
        return this.userService.create(dto)
    } 
}