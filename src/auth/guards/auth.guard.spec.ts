import { Reflector } from "@nestjs/core";
import { AuthGuard } from "./auth.guard"
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let reflector: Reflector;
    let jwtService: JwtService;
    const createBaseContext = (token?:string) => {
        const mockRequest = {
            headers: {
                authorization: token ? token : ''
            },
            'user': undefined,
        }

        return {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: () => ({
                getRequest: () => mockRequest
            })
        } as unknown as ExecutionContext;
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthGuard,
                {
                    provide: JwtService,
                    useValue: {
                        verifyAsync: jest.fn()
                    }
                },
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn()
                    }
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('jwt-salt-example')
                    }
                }
            ]
        }).compile();

        guard = module.get<AuthGuard>(AuthGuard);
        reflector = module.get<Reflector>(Reflector);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActive', () => {
        it('should return true if route is public', async () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
            const jwtSpy = jest.spyOn(jwtService, 'verifyAsync');

            expect(await guard.canActivate(createBaseContext())).toBe(true);
            expect(jwtSpy).not.toHaveBeenCalled();
        });

        it('should return throw error if route is\'t public', async () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
            await expect(guard.canActivate(createBaseContext())).rejects.toThrow(UnauthorizedException);
        });

        it('should return true if token is valid', async () => {
            jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({});
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

            const context = createBaseContext('Bearer token')

            expect(await guard.canActivate(context)).toBe(true);

            const req = context.switchToHttp().getRequest() as any;
            expect(req.user).toEqual({});
        });

        it('should return true if token is\'t valid', async () => {
            jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Не верный токен'));
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
            let context = createBaseContext('Bearer token');
            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });

        it('should reuturn throw error if token have not valid format', async () => {
            jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({});
            const context = createBaseContext('not valid token');
            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException)
        });
    });
});