import { Test, TestingModule } from "@nestjs/testing";
import { ExternalMovieService } from "./externalMovie.service"
import { ConfigService } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import axios from "axios";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { ExternalMovieListDTO, ExternalMovieListSchema } from "./dto/movie.externalListDto";

jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

describe('ExternalMovieService', () => {
    let service: ExternalMovieService;
    let mockCacheManager;

    const mockAxiosInstance = {
            get: jest.fn()          
    };

    beforeEach(async () => {
        mockAxios.create.mockReturnValue(mockAxiosInstance as any);

        mockCacheManager = {
            get: jest.fn(),
            set: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExternalMovieService,
                HttpModule,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('test')
                    }
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: mockCacheManager
                }
            ]
        }).compile();

        service = module.get<ExternalMovieService>(ExternalMovieService);
        
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined();
    })

    describe('.getMoviesByTitle()', () => {
        const TITLE = 'test';
        const cache_key = `movies-by-title:${TITLE}`;

        const expectCacheManagerNotCached = (expectedData: any) => {
            expect(mockCacheManager.get).toHaveBeenCalledTimes(1);
            expect(mockCacheManager.get).toHaveBeenCalledWith(cache_key);
            expect(mockCacheManager.set).toHaveBeenCalledTimes(1);
            expect(mockCacheManager.set).toHaveBeenCalledWith(cache_key, expectedData);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('films', {
                params: { keyword: TITLE }
            });
        };

        it('should return a list of movies', async () => {
            const mockResponse = {
                data: {
                    items: [ { kinopoiskId: 1 }, { kinopoiskId: 2 } ]
                }
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            mockCacheManager.get.mockResolvedValue(false);

            const expectedData: ExternalMovieListDTO = ExternalMovieListSchema.parse(mockResponse.data);
            expect(await service.getMoviesByTitle(TITLE)).toEqual(expectedData);

            expectCacheManagerNotCached(expectedData)
        });

        it('should return a empty list ExternalMovieListDTO', async () => {
            const mockResponse = { data: { items: [] } };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            mockCacheManager.get.mockResolvedValue(false);

            const expectedData: ExternalMovieListDTO = ExternalMovieListSchema.parse({ items: [] })

            expect(await service.getMoviesByTitle(TITLE)).toEqual(expectedData);

            expectCacheManagerNotCached(expectedData)
        });

        it('should return cached data when available', async () => {
            const cachedData: ExternalMovieListDTO = { items: [{ kinopoiskId: 1 }] };
            mockCacheManager.get.mockResolvedValue(cachedData);

            const result = await service.getMoviesByTitle(TITLE);

            expect(result).toEqual(cachedData);
            expect(mockCacheManager.get).toHaveBeenCalledWith(cache_key);
            expect(mockCacheManager.set).not.toHaveBeenCalled();
            expect(mockAxiosInstance.get).not.toHaveBeenCalled();
        });

        it('should handle API errors gracefully', async () => {
            mockCacheManager.get.mockResolvedValue(false);
            mockAxiosInstance.get.mockRejectedValue(new Error('API Error'));

            await expect(service.getMoviesByTitle(TITLE)).rejects.toThrow('API Error');
            expect(mockCacheManager.get).toHaveBeenCalledWith(cache_key);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('films', {
                params: { keyword: TITLE }
            });
            expect(mockCacheManager.set).not.toHaveBeenCalled();
        });
    })

    describe('.getMovieByID()', () => {
        const MOVIE_ID = 123;
        const cache_key = `movie:${MOVIE_ID}`;

        it('should return movie by ID when not cached', async () => {
            const mockResponse = {
                data: {
                    kinopoiskId: MOVIE_ID,
                    title: 'Test Movie',
                    description: 'Test Description'
                }
            };

            mockCacheManager.get.mockResolvedValue(false);
            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await service.getMovieByID(MOVIE_ID);

            expect(result).toEqual(mockResponse.data);
            expect(mockCacheManager.get).toHaveBeenCalledWith(cache_key);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith(`films/${MOVIE_ID}`);
            expect(mockCacheManager.set).toHaveBeenCalledWith(cache_key, mockResponse.data);
        });

        it('should return cached movie when available', async () => {
            const cachedMovie = {
                kinopoiskId: MOVIE_ID,
                title: 'Cached Movie'
            };

            mockCacheManager.get.mockResolvedValue(cachedMovie);

            const result = await service.getMovieByID(MOVIE_ID);

            expect(result).toEqual(cachedMovie);
            expect(mockCacheManager.get).toHaveBeenCalledWith(cache_key);
            expect(mockAxiosInstance.get).not.toHaveBeenCalled();
            expect(mockCacheManager.set).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when movie not found', async () => {
            mockCacheManager.get.mockResolvedValue(false);
            mockAxiosInstance.get.mockResolvedValue({ data: null });

            await expect(service.getMovieByID(MOVIE_ID)).rejects.toThrow('Фильма с таким ID нет');
            expect(mockCacheManager.get).toHaveBeenCalledWith(cache_key);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith(`films/${MOVIE_ID}`);
        });

        it('should handle API errors', async () => {
            mockCacheManager.get.mockResolvedValue(false);
            mockAxiosInstance.get.mockRejectedValue(new Error('Network Error'));

            await expect(service.getMovieByID(MOVIE_ID)).rejects.toThrow('Network Error');
            expect(mockCacheManager.get).toHaveBeenCalledWith(cache_key);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith(`films/${MOVIE_ID}`);
        });
    });

    describe('.getMovieByTitle()', () => {
        const TITLE = 'Test Movie';

        it('should return movie by title successfully', async () => {
            const mockMovieList = {
                items: [{ kinopoiskId: 123, title: TITLE }]
            };
            const mockMovie = {
                kinopoiskId: 123,
                title: TITLE,
                description: 'Test Description'
            };

            jest.spyOn(service as any, 'getMoviesByTitle').mockResolvedValue(mockMovieList);
            jest.spyOn(service as any, 'getMovieByID').mockResolvedValue(mockMovie);

            const result = await service.getMovieByTitle({ title: TITLE } as any);

            expect(result).toEqual(mockMovie);
            expect(service['getMoviesByTitle']).toHaveBeenCalledWith(TITLE);
            expect(service['getMovieByID']).toHaveBeenCalledWith(123);
        });

        it('should throw error when no movies found', async () => {
            const mockMovieList = { items: [] };

            jest.spyOn(service as any, 'getMoviesByTitle').mockResolvedValue(mockMovieList);

            await expect(service.getMovieByTitle({ title: TITLE } as any)).rejects.toThrow();
            expect(service['getMoviesByTitle']).toHaveBeenCalledWith(TITLE);
            expect(service['getMovieByID']).not.toHaveBeenCalled();
        });
    });

    describe('.getPopularMovies()', () => {
        it('should return popular movies list', async () => {
            const mockMovieList = {
                items: [
                    { kinopoiskId: 1 },
                    { kinopoiskId: 2 }
                ]
            };
            const mockMovie1 = { kinopoiskId: 1, title: 'Movie 1' };
            const mockMovie2 = { kinopoiskId: 2, title: 'Movie 2' };

            mockCacheManager.get.mockResolvedValue(false);
            mockAxiosInstance.get.mockResolvedValue({ data: mockMovieList });
            jest.spyOn(service as any, 'getMovieByID')
                .mockResolvedValueOnce(mockMovie1)
                .mockResolvedValueOnce(mockMovie2);

            const result = await service.getPopularMovies();

            expect(result).toEqual([mockMovie1, mockMovie2]);
            expect(mockCacheManager.get).toHaveBeenCalledWith('movie-popular');
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('films', {
                params: { order: 'RATING', page: 1 }
            });
            expect(service['getMovieByID']).toHaveBeenCalledWith(1);
            expect(service['getMovieByID']).toHaveBeenCalledWith(2);
            expect(mockCacheManager.set).toHaveBeenCalledWith('movie-popular', [mockMovie1, mockMovie2]);
        });

        it('should return cached popular movies when available', async () => {
            const cachedMovies = [
                { kinopoiskId: 1, title: 'Cached Movie 1' },
                { kinopoiskId: 2, title: 'Cached Movie 2' }
            ];

            mockCacheManager.get.mockResolvedValue(cachedMovies);

            const result = await service.getPopularMovies();

            expect(result).toEqual(cachedMovies);
            expect(mockCacheManager.get).toHaveBeenCalledWith('movie-popular');
            expect(mockAxiosInstance.get).not.toHaveBeenCalled();
            expect(mockCacheManager.set).not.toHaveBeenCalled();
        });

        it('should handle empty popular movies list', async () => {
            mockCacheManager.get.mockResolvedValue(false);
            mockAxiosInstance.get.mockResolvedValue({ data: { items: [] } });

            const result = await service.getPopularMovies();

            expect(result).toEqual([]);
            expect(mockCacheManager.set).toHaveBeenCalledWith('movie-popular', []);
        });

        it('should handle errors during popular movies fetch', async () => {
            mockCacheManager.get.mockResolvedValue(false);
            mockAxiosInstance.get.mockRejectedValue(new Error('API Error'));

            await expect(service.getPopularMovies()).rejects.toThrow('API Error');
            expect(mockCacheManager.get).toHaveBeenCalledWith('movie-popular');
            expect(mockCacheManager.set).not.toHaveBeenCalled();
        });
    });
});