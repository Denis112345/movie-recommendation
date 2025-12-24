import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './entitys/user.entity';
import { MovieService } from '../movie/movie.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Raiting } from '../raiting/entitys/raiting.entity';
import { Movie } from '../movie/entitys/movie.entity';

describe('UserService - getSimmilarityUserRaitings', () => {
  let service: UserService;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockMovieService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: {},
        },
        {
          provide: MovieService,
          useValue: mockMovieService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('getSimmilarityUserRaitings', () => {
    it('должен возвращать 0 если один из массивов пустой', () => {
      const movie1 = { title: 'Фильм 1' } as Movie;
      const raitings1 = [
        { movie: movie1, raiting: 5 } as Raiting,
      ];
      const raitings2: Raiting[] = [];

      const result = service.getSimmilarityUserRaitings(raitings1, raitings2);
      expect(result).toBe(0);
    });

    it('должен вычислять косинусное сходство для идентичных оценок', () => {
      const movie1 = { title: 'Фильм 1' } as Movie;
      const movie2 = { title: 'Фильм 2' } as Movie;
      
      const raitings1 = [
        { movie: movie1, raiting: 5 } as Raiting,
        { movie: movie2, raiting: 4 } as Raiting,
      ];
      const raitings2 = [
        { movie: movie1, raiting: 5 } as Raiting,
        { movie: movie2, raiting: 4 } as Raiting,
      ];

      const result = service.getSimmilarityUserRaitings(raitings1, raitings2);
      expect(result).toBeCloseTo(1.0, 5); // Должно быть близко к 1.0
    });

    it('должен вычислять косинусное сходство для противоположных оценок', () => {
      const movie1 = { title: 'Фильм 1' } as Movie;
      const movie2 = { title: 'Фильм 2' } as Movie;
      
      const raitings1 = [
        { movie: movie1, raiting: 5 } as Raiting,
        { movie: movie2, raiting: 1 } as Raiting,
      ];
      const raitings2 = [
        { movie: movie1, raiting: 1 } as Raiting,
        { movie: movie2, raiting: 5 } as Raiting,
      ];

      const result = service.getSimmilarityUserRaitings(raitings1, raitings2);
      expect(result).toBeLessThan(0.5); // Должно быть низкое сходство
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('должен обрабатывать частичное пересечение фильмов', () => {
      const movie1 = { title: 'Фильм 1' } as Movie;
      const movie2 = { title: 'Фильм 2' } as Movie;
      const movie3 = { title: 'Фильм 3' } as Movie;
      
      const raitings1 = [
        { movie: movie1, raiting: 5 } as Raiting,
        { movie: movie2, raiting: 4 } as Raiting,
      ];
      const raitings2 = [
        { movie: movie1, raiting: 4 } as Raiting,
        { movie: movie3, raiting: 5 } as Raiting,
      ];

      const result = service.getSimmilarityUserRaitings(raitings1, raitings2);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('должен обрабатывать случай когда нет общих фильмов', () => {
      const movie1 = { title: 'Фильм 1' } as Movie;
      const movie2 = { title: 'Фильм 2' } as Movie;
      
      const raitings1 = [
        { movie: movie1, raiting: 5 } as Raiting,
      ];
      const raitings2 = [
        { movie: movie2, raiting: 5 } as Raiting,
      ];

      const result = service.getSimmilarityUserRaitings(raitings1, raitings2);
      expect(result).toBe(0); // Нет общих фильмов = 0
    });

    it('должен корректно вычислять для большого количества фильмов', () => {
      const movies = Array.from({ length: 10 }, (_, i) => ({ title: `Фильм ${i + 1}` } as Movie));
      
      const raitings1 = movies.map((movie, i) => ({
        movie,
        raiting: 3 + (i % 3),
      })) as Raiting[];
      
      const raitings2 = movies.map((movie, i) => ({
        movie,
        raiting: 3 + ((i + 1) % 3),
      })) as Raiting[];

      const result = service.getSimmilarityUserRaitings(raitings1, raitings2);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
      expect(isNaN(result)).toBe(false);
    });
  });
});

