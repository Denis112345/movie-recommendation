import { Test, TestingModule } from "@nestjs/testing"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { AuthCreateDTO, AuthCreateSchema } from "./dto/auth.createDto";
import { CreatedAuthUserDTO } from "./dto/auth.createdDto";


describe('AuthController', () => {
    let module: TestingModule;
    let controller: AuthController;
    let service: AuthService;

    beforeEach(async () => {
            module = await Test.createTestingModule({
                controllers: [AuthController],
                providers: [
                    {
                        provide: AuthService,
                        useValue: {
                            createUser: jest.fn(),
                            signIn: jest.fn()
                        }
                    }
                ]
            }).compile();

            controller = module.get<AuthController>(AuthController);
            service = module.get<AuthService>(AuthService);
        });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
    });

    describe('.createUser()', () => {
        it('should return CreatedAuthUserDTO data instance', async () => {
            // Подготовка данных
            const dto: AuthCreateDTO = AuthCreateSchema.parse({
                username: 'testuser',
                email: 'test@gmail.com',
                password: 'TestPassword12'
            });
            const dataToReturn: CreatedAuthUserDTO = { id: 1, ...dto };
            jest.spyOn(service, 'createUser').mockResolvedValue(dataToReturn);

            // Тестированиеs
            const result = await controller.createUser(dto);

            // Проверка
            expect(result).toEqual<CreatedAuthUserDTO>(dataToReturn);
            expect(service.createUser).toHaveBeenCalledWith(dto);
            expect(service.createUser).toHaveBeenCalledTimes(1);
        });
    });

    describe('signIn', () => {
        it('should return jwt-token', async () => {
            const dto = { username: 'test', password: 'password' };
            const returnedData = {jwt_token: 'jwt-token'};
            jest.spyOn(service, 'signIn').mockResolvedValue(returnedData);

            const result = await controller.signIn(dto);

            expect(result).toEqual(returnedData);
            expect(service.signIn).toHaveBeenCalledWith(dto);
            expect(service.signIn).toHaveBeenCalledTimes(1);
        });
    });
});