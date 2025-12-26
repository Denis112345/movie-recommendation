import { Body, Controller, Get, HttpCode, HttpStatus, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { AuthCreateSchema } from "./dto/auth.createDto";
import type { AuthCreateDTO } from "./dto/auth.createDto";
import { User } from "src/user/entitys/user.entity";
import { UserService } from "src/user/user.service";
import { AuthSignInSchema } from "./dto/auth.signInDto";
import type { AuthSignInDTO } from "./dto/auth.signInDto";
import { AuthService } from "./auth.service";
import { Public } from "src/app.decorator";
import { CreatedAuthUserDTO } from "./dto/auth.createdDto";


@Controller('auth')
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService
    ){}

    @Public()
    @Post('register')
    @UsePipes(new ZodValidationPipe(AuthCreateSchema))
    async createUser(@Body() dto: AuthCreateDTO): Promise<CreatedAuthUserDTO> {
        return this.authService.createUser(dto)
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    @UsePipes(new ZodValidationPipe(AuthSignInSchema))
    async signIn(@Body() dto: AuthSignInDTO): Promise<{jwt_token: string}> {
        return await this.authService.signIn(dto)
    }
}