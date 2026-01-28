import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MovieRequestCreateSchema } from './dto/movie.createDto';
import { Movie } from './entitys/movie.entity';

describe('MovieController', () => {
  let controller: MovieController;
  let movieService: MovieService;
  let cacheManager: Cache;

  const mockMovieService = {
    getAllMovies: jest.fn(),
    getMovie: jest.fn(),
    create: jest.fn(),
    getAvgMovieRaiting: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
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

    controller = module.get<MovieController>(MovieController);
    movieService = module.get<MovieService>(MovieService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(movieService).toBeDefined();
    expect(cacheManager).toBeDefined();
  });

  describe('getAllMovies', () => {
    it('should return all movies', async () => {
      const mockMovies: Movie[] = [
        { id: 1, title: 'Movie 1', description: 'Description 1' } as Movie,
        { id: 2, title: 'Movie 2', description: 'Description 2' } as Movie,
      ];

      mockMovieService.getAllMovies.mockResolvedValue(mockMovies);

      const result = await controller.getAllMovies();

      expect(result).toEqual(mockMovies);
      expect(movieService.getAllMovies).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no movies exist', async () => {
      mockMovieService.getAllMovies.mockResolvedValue([]);

      const result = await controller.getAllMovies();

      expect(result).toEqual([]);
      expect(movieService.getAllMovies).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMovie', () => {
    it('should return a movie by id', async () => {
      const mockMovie: Movie = { 
        id: 1, 
        title: 'Test Movie', 
        description: 'Test Description' 
      } as Movie;

      mockMovieService.getMovie.mockResolvedValue(mockMovie);

      const result = await controller.getMovie(1);

      expect(result).toEqual(mockMovie);
      expect(movieService.getMovie).toHaveBeenCalledWith(1);
      expect(movieService.getMovie).toHaveBeenCalledTimes(1);
    });

    it('should throw error when movie not found', async () => {
      const error = new Error('Movie not found');
      mockMovieService.getMovie.mockRejectedValue(error);

      await expect(controller.getMovie(999)).rejects.toThrow('Movie not found');
      expect(movieService.getMovie).toHaveBeenCalledWith(999);
      expect(movieService.getMovie).toHaveBeenCalledTimes(1);
    });
  });

  describe('addMovie', () => {
    it('should create a new movie', async () => {
      const movieDto = MovieRequestCreateSchema.parse({
        title: 'New Movie',
        description: 'New Description',
      });

      const createdMovie: Movie = {
        id: 1,
        ...movieDto,
      } as Movie;

      mockMovieService.create.mockResolvedValue(createdMovie);

      const result = await controller.addMovie(movieDto);

      expect(result).toEqual(createdMovie);
      expect(movieService.create).toHaveBeenCalledWith(movieDto);
      expect(movieService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error when creating movie with invalid data', async () => {
      const invalidDto = { title: '', description: '' };

      await expect(controller.addMovie(invalidDto as any)).rejects.toThrow();
      expect(movieService.create).not.toHaveBeenCalled();
    });
  });

  describe('getMovieRaiting', () => {
    it('should return cached rating when available', async () => {
      const movieId = 1;
      const cachedRating = 4.5;
      const cacheKey = `movie_raiting_avg:${movieId}`;

      mockCacheManager.get.mockResolvedValue(cachedRating);

      const result = await controller.getMovieRaiting(movieId);

      expect(result).toBe(cachedRating);
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(movieService.getAvgMovieRaiting).not.toHaveBeenCalled();
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should calculate and cache rating when not cached', async () => {
      const movieId = 1;
      const calculatedRating = 4.2;
      const cacheKey = `movie_raiting_avg:${movieId}`;

      mockCacheManager.get.mockResolvedValue(undefined);
      mockMovieService.getAvgMovieRaiting.mockResolvedValue(calculatedRating);

      const result = await controller.getMovieRaiting(movieId);

      expect(result).toBe(calculatedRating);
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(movieService.getAvgMovieRaiting).toHaveBeenCalledWith(movieId);
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, calculatedRating, 30000);
    });

    it('should handle rating calculation error', async () => {
      const movieId = 1;
      const cacheKey = `movie_raiting_avg:${movieId}`;
      const error = new Error('Calculation error');

      mockCacheManager.get.mockResolvedValue(undefined);
      mockMovieService.getAvgMovieRaiting.mockRejectedValue(error);

      await expect(controller.getMovieRaiting(movieId)).rejects.toThrow('Calculation error');
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(movieService.getAvgMovieRaiting).toHaveBeenCalledWith(movieId);
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });
});
