import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/user/entitys/user.entity";
import { UserService } from "src/user/user.service";
import { AuthSignInDTO } from "./dto/auth.signInDto";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthService {
    constructor (
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async signIn (dto: AuthSignInDTO): Promise<{jwt_token: string}> {
        const user: User | null = await this.userService.findByUsername(dto.username)
        if (user?.password !== dto.password) {
            throw new UnauthorizedException()
        }
        const payload: {sub: number, username: string} = {sub: user.id, username: user.username}

        return {
            jwt_token: await this.jwtService.signAsync(payload)
        }
    }
}