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

    const BASE_CONTEXT = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
            getRequest: () => ({
                headers: {
                    authorization: ''
                },
            })
        })
    } as unknown as ExecutionContext

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
        it('should return true if route is public', () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
            expect(guard.canActivate(BASE_CONTEXT)).resolves.toBe(true)
        });

        it('should return throw error if route is\'t public', () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
            expect(guard.canActivate(BASE_CONTEXT)).rejects.toThrow(UnauthorizedException)
        });

        it('should return true if token is valid', () => {
            jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({})
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
            expect(guard.canActivate(BASE_CONTEXT)).rejects
        })
    });
});