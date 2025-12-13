import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "src/constanst";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector
    ){}
    
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic: string | undefined = this.reflector.getAllAndOverride(IS_PUBLIC_KEY,[
            context.getHandler(),
            context.getClass()
        ])
        
        if (isPublic) {
            return true
        }

        const request: Request = context.switchToHttp().getRequest()
        const token = this.getTokenWithRequest(request)

        try {
            request['user'] = await this.jwtService.verifyAsync(token)
            return true
        } catch {
            throw new UnauthorizedException()
        }
    }

    private getTokenWithRequest(request: Request) {
        const [type_token, token] = request.headers.authorization?.split(' ') ?? [undefined, undefined]
        if (type_token != 'Bearer' || !token) throw new UnauthorizedException()
        return token
    }
}