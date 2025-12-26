import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "src/constanst";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
        private readonly configService: ConfigService
    ){};
    
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic: string | undefined = this.reflector.getAllAndOverride(IS_PUBLIC_KEY,[
            context.getHandler(),
            context.getClass()
        ]);
        
        if (isPublic) return true;
        
        const request: Request = context.switchToHttp().getRequest();
        const token = this.getTokenWithRequest(request);

        if (!token) throw new UnauthorizedException('Токен не найден.');

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('jwt.salt')
            });

            request['user'] = payload
        } catch (e) {
            throw new UnauthorizedException('Неправильный или истекший токен.');
        }

        return true;
    };

    private getTokenWithRequest(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    };
}