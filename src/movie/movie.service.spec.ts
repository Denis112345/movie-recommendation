import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { getModelToken } from '@nestjs/sequelize';
import { Movie } from './entitys/movie.entity';
import { Genre } from './entitys/genre.entity';
import { ExternalMovieService } from '../externalMovie/externalMovie.service';
import { MovieRequestCreateDTO, MovieRequestCreateSchema } from './dto/movie.createDto';
import { GenreDTO, GenreSchema } from './dto/genre.dto';
import { MovieExternalDTO } from '../externalMovie/dto/movie.externalDto';
import { Raiting } from '../raiting/entitys/raiting.entity';
import { BadRequestException } from '@nestjs/common';

describe('MovieService', () => {
  let service: MovieService;
  let movieRepo: typeof Movie;
  let genreRepo: typeof Genre;
  let externalMovieService: ExternalMovieService;

  const mockMovie = {
    id: 1,
    title: 'Test Movie',
    description: 'Test Description',
    releaseYear: 2023,
    $set: jest.fn(),
  } as any;

  const mockGenre = {
    id: 1,
    title: 'Action',
  } as any;

  const mockExternalMovie: MovieExternalDTO = {
    kinopoiskId: 123,
    title: 'Test Movie',
    description: 'Test Description',
    year: 2023,
    genres: ['Action', 'Drama'],
    ratingImdb: 8.5,
  } as any;

  const mockMovieRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  };

  const mockGenreRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockExternalMovieService = {
    getMovieByTitle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getModelToken(Movie),
          useValue: mockMovieRepo,
        },
        {
          provide: getModelToken(Genre),
          useValue: mockGenreRepo,
        },
        {
          provide: ExternalMovieService,
          useValue: mockExternalMovieService,
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    movieRepo = module.get<typeof Movie>(getModelToken(Movie));
    genreRepo = module.get<typeof Genre>(getModelToken(Genre));
    externalMovieService = module.get<ExternalMovieService>(ExternalMovieService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(movieRepo).toBeDefined();
    expect(genreRepo).toBeDefined();
    expect(externalMovieService).toBeDefined();
  });

  describe('movieExists', () => {
    it('should return true when movie exists', async () => {
      mockMovieRepo.findOne.mockResolvedValue(mockMovie);

      const result = await service.movieExists('Test Movie');

      expect(result).toBe(true);
      expect(movieRepo.findOne).toHaveBeenCalledWith({ where: { title: 'Test Movie' } });
    });

    it('should return false when movie does not exist', async () => {
      mockMovieRepo.findOne.mockResolvedValue(null);

      const result = await service.movieExists('Nonexistent Movie');

      expect(result).toBe(false);
      expect(movieRepo.findOne).toHaveBeenCalledWith({ where: { title: 'Nonexistent Movie' } });
    });
  });

  describe('create', () => {
    const mockDto: MovieRequestCreateDTO = MovieRequestCreateSchema.parse({
      title: 'Test Movie',
    });

    it('should create a new movie successfully', async () => {
      mockExternalMovieService.getMovieByTitle.mockResolvedValue(mockExternalMovie);
      mockGenreRepo.findOne.mockResolvedValue(null);
      mockGenreRepo.create.mockResolvedValue(mockGenre);
      mockMovieRepo.findOne.mockResolvedValue(null);
      mockMovieRepo.create.mockResolvedValue(mockMovie);

      const result = await service.create(mockDto);

      expect(result).toEqual(mockMovie);
      expect(externalMovieService.getMovieByTitle).toHaveBeenCalledWith(mockDto);
      expect(mockMovieRepo.create).toHaveBeenCalled();
      expect(mockMovie.$set).toHaveBeenCalledWith('genres', [mockGenre, mockGenre]);
    });

    it('should throw BadRequestException when movie already exists', async () => {
      mockExternalMovieService.getMovieByTitle.mockResolvedValue(mockExternalMovie);
      mockGenreRepo.findOne.mockResolvedValue(mockGenre);
      mockMovieRepo.findOne.mockResolvedValue(mockMovie);

      await expect(service.create(mockDto)).rejects.toThrow(BadRequestException);
      expect(mockMovieRepo.create).not.toHaveBeenCalled();
    });

    it('should create new genres when they do not exist', async () => {
      mockExternalMovieService.getMovieByTitle.mockResolvedValue(mockExternalMovie);
      mockGenreRepo.findOne.mockResolvedValue(null);
      mockGenreRepo.create.mockResolvedValue(mockGenre);
      mockMovieRepo.findOne.mockResolvedValue(null);
      mockMovieRepo.create.mockResolvedValue(mockMovie);

      await service.create(mockDto);

      expect(mockGenreRepo.create).toHaveBeenCalledTimes(2);
      expect(mockGenreRepo.create).toHaveBeenCalledWith({ title: 'Action' });
      expect(mockGenreRepo.create).toHaveBeenCalledWith({ title: 'Drama' });
    });
  });

  describe('createGenre', () => {
    const genreDto: GenreDTO = GenreSchema.parse({ title: 'Action' });

    it('should return existing genre', async () => {
      mockGenreRepo.findOne.mockResolvedValue(mockGenre);

      const result = await service.createGenre(genreDto);

      expect(result).toEqual(mockGenre);
      expect(genreRepo.findOne).toHaveBeenCalledWith({ where: { title: 'Action' } });
      expect(genreRepo.create).not.toHaveBeenCalled();
    });

    it('should create new genre when it does not exist', async () => {
      mockGenreRepo.findOne.mockResolvedValue(null);
      mockGenreRepo.create.mockResolvedValue(mockGenre);

      const result = await service.createGenre(genreDto);

      expect(result).toEqual(mockGenre);
      expect(genreRepo.findOne).toHaveBeenCalledWith({ where: { title: 'Action' } });
      expect(genreRepo.create).toHaveBeenCalledWith(genreDto);
    });
  });

  describe('getAllMovies', () => {
    it('should return all movies with genres', async () => {
      const movies = [mockMovie];
      mockMovieRepo.findAll.mockResolvedValue(movies);

      const result = await service.getAllMovies();

      expect(result).toEqual(movies);
      expect(movieRepo.findAll).toHaveBeenCalledWith({
        include: {
          model: Genre,
          through: { attributes: [] }
        }
      });
    });

    it('should return empty array when no movies exist', async () => {
      mockMovieRepo.findAll.mockResolvedValue([]);

      const result = await service.getAllMovies();

      expect(result).toEqual([]);
    });
  });

  describe('getBestMovies', () => {
    it('should return best movies ordered by rating', async () => {
      const movies = [mockMovie];
      mockMovieRepo.findAll.mockResolvedValue(movies);

      const result = await service.getBestMovies(10);

      expect(result).toEqual(movies);
      expect(movieRepo.findAll).toHaveBeenCalledWith({
        attributes: {
          include: [
            [expect.any(Function), 'avg_raiting']
          ]
        },
        include: [{
          model: Raiting,
          attributes: []
        }],
        group: ['Movie.id'],
        order: [[expect.any(Object), 'DESC']],
        limit: 10,
        subQuery: false
      });
    });
  });

  describe('getMovie', () => {
    it('should return movie with genres and ratings', async () => {
      const movieWithRelations = {
        ...mockMovie,
        Genres: [mockGenre],
        Raitings: [],
      };
      mockMovieRepo.findOne.mockResolvedValue(movieWithRelations);

      const result = await service.getMovie(1);

      expect(result).toEqual(movieWithRelations);
      expect(movieRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        include: [
          {
            model: Genre,
            through: { attributes: [] }
          },
          {
            model: Raiting,
            required: false
          }
        ],
      });
    });

    it('should throw BadRequestException when movie not found', async () => {
      mockMovieRepo.findOne.mockResolvedValue(null);

      await expect(service.getMovie(999)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAvgMovieRaiting', () => {
    it('should return 0 when movie has no ratings', async () => {
      const movieWithNoRatings = {
        ...mockMovie,
        Raitings: [],
      };
      mockMovieRepo.findOne.mockResolvedValue(movieWithNoRatings);

      const result = await service.getAvgMovieRaiting(1);

      expect(result).toBe(0);
    });

    it('should return average rating when movie has ratings', async () => {
      const movieWithRatings = {
        ...mockMovie,
        Raitings: [
          { raiting: 5 },
          { raiting: 3 },
          { raiting: 4 },
        ],
      };
      mockMovieRepo.findOne.mockResolvedValue(movieWithRatings);

      const result = await service.getAvgMovieRaiting(1);

      expect(result).toBe(4); // (5 + 3 + 4) / 3 = 4
    });

    it('should handle undefined Raitings array', async () => {
      const movieWithUndefinedRatings = {
        ...mockMovie,
        Raitings: undefined,
      };
      mockMovieRepo.findOne.mockResolvedValue(movieWithUndefinedRatings);

      const result = await service.getAvgMovieRaiting(1);

      expect(result).toBe(0);
    });
  });
});
