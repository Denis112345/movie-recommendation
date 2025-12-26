import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { User } from "src/user/entitys/user.entity";
import { UserService } from "src/user/user.service";
import { AuthSignInDTO } from "./dto/auth.signInDto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)
    constructor (
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async signIn (dto: AuthSignInDTO): Promise<{jwt_token: string}> {
        const user: User | null = await this.userService.findByUsername(dto.username)

        const isPasswordValid = user
            ? await bcrypt.compare(dto.password, user.password)
            : false;

        if (!isPasswordValid || !user) {
            this.logger.warn(`Попытка входа в аккаунт ${user ? user.username : 'которого нет'}`)
            throw new UnauthorizedException('Неверные данные :(')
        }

        const payload: {sub: number, username: string} = {sub: user.id, username: user.username}

        return {
            jwt_token: await this.jwtService.signAsync(payload)
        }
    }
}