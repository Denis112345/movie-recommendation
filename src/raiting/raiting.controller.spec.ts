import { Test, TestingModule } from '@nestjs/testing';
import { RaitingController } from './raiting.controller';
import { RaitingService } from './raiting.service';
import { RaitingSchema } from './dto/raiting.dto';
import type { RaitingDTO } from './dto/raiting.dto';
import { Raiting } from './entitys/raiting.entity';

describe('RaitingController', () => {
  let controller: RaitingController;
  let raitingService: RaitingService;

  const mockRaitingService = {
    createRaiting: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaitingController],
      providers: [
        {
          provide: RaitingService,
          useValue: mockRaitingService,
        },
      ],
    }).compile();

    controller = module.get<RaitingController>(RaitingController);
    raitingService = module.get<RaitingService>(RaitingService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(raitingService).toBeDefined();
  });

  describe('addRaitingToMovie', () => {
    it('should create a new rating', async () => {
      const ratingDto: RaitingDTO = RaitingSchema.parse({
        movie_id: 1,
        user_id: 1,
        raiting: 5,
      });

      const createdRaiting: Raiting = {
        id: 1,
        ...ratingDto,
      } as Raiting;

      mockRaitingService.createRaiting.mockResolvedValue(createdRaiting);

      const result = await controller.addRaitingToMovie(ratingDto);

      expect(result).toEqual(createdRaiting);
      expect(raitingService.createRaiting).toHaveBeenCalledWith(ratingDto);
      expect(raitingService.createRaiting).toHaveBeenCalledTimes(1);
    });

    it('should throw error when creating rating with invalid data', async () => {
      const invalidDto = { movie_id: -1, user_id: 1, raiting: 6 };

      await expect(controller.addRaitingToMovie(invalidDto as any)).rejects.toThrow();
      expect(raitingService.createRaiting).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      const ratingDto: RaitingDTO = RaitingSchema.parse({
        movie_id: 1,
        user_id: 1,
        raiting: 5,
      });

      const error = new Error('Service error');
      mockRaitingService.createRaiting.mockRejectedValue(error);

      await expect(controller.addRaitingToMovie(ratingDto)).rejects.toThrow('Service error');
      expect(raitingService.createRaiting).toHaveBeenCalledWith(ratingDto);
      expect(raitingService.createRaiting).toHaveBeenCalledTimes(1);
    });

    it('should create rating with minimum valid rating value', async () => {
      const ratingDto: RaitingDTO = RaitingSchema.parse({
        movie_id: 1,
        user_id: 1,
        raiting: 1,
      });

      const createdRaiting: Raiting = {
        id: 1,
        ...ratingDto,
      } as Raiting;

      mockRaitingService.createRaiting.mockResolvedValue(createdRaiting);

      const result = await controller.addRaitingToMovie(ratingDto);

      expect(result).toEqual(createdRaiting);
      expect(raitingService.createRaiting).toHaveBeenCalledWith(ratingDto);
    });

    it('should create rating with maximum valid rating value', async () => {
      const ratingDto: RaitingDTO = RaitingSchema.parse({
        movie_id: 1,
        user_id: 1,
        raiting: 5,
      });

      const createdRaiting: Raiting = {
        id: 1,
        ...ratingDto,
      } as Raiting;

      mockRaitingService.createRaiting.mockResolvedValue(createdRaiting);

      const result = await controller.addRaitingToMovie(ratingDto);

      expect(result).toEqual(createdRaiting);
      expect(raitingService.createRaiting).toHaveBeenCalledWith(ratingDto);
    });
  });
});
