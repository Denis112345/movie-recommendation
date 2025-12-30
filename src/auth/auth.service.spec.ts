import { AuthService } from "./auth.service"
import { AuthCreateDTO, AuthCreateSchema } from "./dto/auth.createDto";
import { CreatedAuthUserDTO, CreatedAuthUserSchema } from "./dto/auth.createdDto";
import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException } from "@nestjs/common";

describe('AuthService', () => {
    let service: AuthService;

    const mockUserService = {
        create: jest.fn().mockImplementation((dto: AuthCreateDTO) => {
            const mockUserCreated = {
                id: 1,
                username: dto.username,
                email: dto.email
            }
            return { get: jest.fn().mockReturnValue(mockUserCreated) }
        })
    };


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
                    useValue: {}
                },
            ]
        }).compile();

        service = module.get<AuthService>(AuthService)
    });

    describe('.createUser()', () => {
        it('should create user and return it', async () => {
            // Arrange - подготовка моковых данных
            const dto: AuthCreateDTO = AuthCreateSchema.parse(
                { username: 'test', email: 'test@gmail.com', password: 'TestPass121212' }
            );

            // Act - действие
            const result = await service.createUser(dto);

            // Assert - Проверка результата
            expect(result).toEqual(CreatedAuthUserSchema.parse(
                { id: 1, username: dto.username, email: dto.email }
            ));

            expect(mockUserService.create).toHaveBeenCalledTimes(1)
        });

        it('should throw an error when dto is null', async () => {
            expect(service.createUser(null as any)).rejects.toThrow(BadRequestException)
        })

        it('should throw an error if there is not enough data in the dto', async () => {
            const dto =  { email: 'test@gmail.com', password: 'TestPass121212' }
            expect(service.createUser(dto as any)).rejects.toThrow(BadRequestException)
        })
    })

    
});