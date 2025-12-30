import { AuthService } from "./auth.service"
import { AuthCreateDTO, AuthCreateSchema } from "./dto/auth.createDto";
import { CreatedAuthUserSchema } from "./dto/auth.createdDto";
import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { AuthSignInSchema } from "./dto/auth.signInDto";

describe('AuthService', () => {
    let service: AuthService;

    const USER_PASSWORD: string = 'password123123'
    const USERNAME: string = 'test123'
    const SALT_ROUND: number = 10

    const mockUserService = {
        create: jest.fn().mockImplementation((dto: AuthCreateDTO) => {
            const mockUserCreated = {
                id: 1,
                username: dto.username,
                email: dto.email
            }
            return { get: jest.fn().mockReturnValue(mockUserCreated) }
        }),
        findByUsername: jest.fn().mockImplementation(async (username: string) => {
                const mockUserCreated = {
                    id: 1,
                    username: username,
                    password:  await bcrypt.hash(USER_PASSWORD, SALT_ROUND),
                }

                return username == USERNAME ? { 
                    ...mockUserCreated,
                    get: jest.fn().mockReturnValue(mockUserCreated)
                } : null
            }
        )
    };

    const mockJwtService = {
        signAsync: jest.fn().mockReturnValue('jwt-token')
    }


    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: mockUserService
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService
                },
            ]
        }).compile();

        service = module.get<AuthService>(AuthService)
    });

    describe('.createUser()', () => {
        it('should create user and return it', async () => {
            // Arrange - подготовка моковых данных
            const dto: AuthCreateDTO = AuthCreateSchema.parse(
                { username: USERNAME, email: 'test@gmail.com', password: 'TestPass121212' }
            );

            // Act - действие
            const result = await service.createUser(dto);

            // Assert - Проверка результата
            expect(result).toEqual(CreatedAuthUserSchema.parse(
                { id: 1, username: dto.username, email: dto.email }
            ));

            expect(mockUserService.create).toHaveBeenCalledTimes(1);
        });

        it('should throw an error when dto is null', async () => {
            expect(service.createUser(null as any)).rejects.toThrow(BadRequestException);
        });

        it('should throw an error if there is not enough data in the dto', async () => {
            const dto =  { email: 'test@gmail.com', password: 'TestPass121212' };
            expect(service.createUser(dto as any)).rejects.toThrow(BadRequestException);
        });
    });

    describe('.signIn()', () => {
        it('should sign in user and return jwt token', async () => {
            const mockData = AuthSignInSchema.parse({
                username: USERNAME,
                password: USER_PASSWORD
            });

            const result = await service.signIn(mockData);
            expect(result).toEqual({jwt_token: 'jwt-token'});
        });

        it('should throw an BadRequest when dto is null', async () => {
            const mockData: any = null
            expect(service.signIn(mockData)).rejects.toThrow(BadRequestException)
        });

        it('should throw an BadRequest when username is not valid', async () => {
            const mockData = AuthSignInSchema.parse({
                username: 'test1234',
                password: USER_PASSWORD
            });
            expect(service.signIn(mockData)).rejects.toThrow(UnauthorizedException)
        });

        it('should throw an BadRequest when password is not valid', async () => {
            const mockData = AuthSignInSchema.parse({
                username: USERNAME,
                password: 'bad password'
            });
            expect(service.signIn(mockData)).rejects.toThrow(UnauthorizedException)
        });
    });
});