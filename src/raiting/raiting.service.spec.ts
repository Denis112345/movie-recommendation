import { Test, TestingModule } from '@nestjs/testing';
import { RaitingService } from './raiting.service';
import { getModelToken } from '@nestjs/sequelize';
import { Raiting } from './entitys/raiting.entity';
import { RaitingDTO, RaitingSchema } from './dto/raiting.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';

describe('RaitingService', () => {
  let service: RaitingService;
  let raitingRepo: typeof Raiting;
  let cacheManager: Cache;

  const mockRaiting = {
    id: 1,
    movie_id: 1,
    user_id: 1,
    raiting: 5,
  } as Raiting;

  const mockRaitingRepo = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCacheManager = {
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RaitingService,
        {
          provide: getModelToken(Raiting),
          useValue: mockRaitingRepo,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<RaitingService>(RaitingService);
    raitingRepo = module.get<typeof Raiting>(getModelToken(Raiting));
    cacheManager = module.get<Cache>(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(raitingRepo).toBeDefined();
    expect(cacheManager).toBeDefined();
  });

  describe('createRaiting', () => {
    it('should create a new rating and clear cache', async () => {
      const ratingDto: RaitingDTO = RaitingSchema.parse({
        movie_id: 1,
        user_id: 1,
        raiting: 5,
      });

      mockRaitingRepo.create.mockResolvedValue(mockRaiting);

      const result = await service.createRaiting(ratingDto);

      expect(result).toEqual(mockRaiting);
      expect(cacheManager.del).toHaveBeenCalledWith(`user_rec:${ratingDto.user_id}`);
      expect(raitingRepo.create).toHaveBeenCalledWith(ratingDto);
      expect(raitingRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors during rating creation', async () => {
      const ratingDto: RaitingDTO = RaitingSchema.parse({
        movie_id: 1,
        user_id: 1,
        raiting: 5,
      });

      const error = new Error('Database error');
      mockRaitingRepo.create.mockRejectedValue(error);

      await expect(service.createRaiting(ratingDto)).rejects.toThrow('Database error');
      expect(cacheManager.del).toHaveBeenCalledWith(`user_rec:${ratingDto.user_id}`);
      expect(raitingRepo.create).toHaveBeenCalledWith(ratingDto);
    });

    it('should clear cache even when rating creation fails', async () => {
      const ratingDto: RaitingDTO = RaitingSchema.parse({
        movie_id: 1,
        user_id: 2,
        raiting: 3,
      });

      const error = new Error('Creation failed');
      mockRaitingRepo.create.mockRejectedValue(error);

      await expect(service.createRaiting(ratingDto)).rejects.toThrow('Creation failed');
      expect(cacheManager.del).toHaveBeenCalledWith(`user_rec:${ratingDto.user_id}`);
    });
  });

  describe('getRaitingByID', () => {
    it('should return rating by id', async () => {
      mockRaitingRepo.findOne.mockResolvedValue(mockRaiting);

      const result = await service.getRaitingByID(1);

      expect(result).toEqual(mockRaiting);
      expect(raitingRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(raitingRepo.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when rating not found', async () => {
      mockRaitingRepo.findOne.mockResolvedValue(null);

      await expect(service.getRaitingByID(999)).rejects.toThrow(BadRequestException);
      await expect(service.getRaitingByID(999)).rejects.toThrow('Рейтинга с таким ID нет');
      expect(raitingRepo.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(raitingRepo.findOne).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors during rating lookup', async () => {
      const error = new Error('Database connection error');
      mockRaitingRepo.findOne.mockRejectedValue(error);

      await expect(service.getRaitingByID(1)).rejects.toThrow('Database connection error');
      expect(raitingRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should work with different rating ids', async () => {
      const differentRating = { ...mockRaiting, id: 42 };
      mockRaitingRepo.findOne.mockResolvedValue(differentRating);

      const result = await service.getRaitingByID(42);

      expect(result).toEqual(differentRating);
      expect(raitingRepo.findOne).toHaveBeenCalledWith({ where: { id: 42 } });
    });
  });
});
