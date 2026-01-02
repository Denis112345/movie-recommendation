import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { User, UserCreationAttributes } from "./entitys/user.entity";
import { AuthCreateDTO } from "../auth/dto/auth.createDto";
import { InjectModel } from "@nestjs/sequelize";
import { CreateOptions, Op } from "sequelize";
import { MovieService } from "src/movie/movie.service";
import { Raiting } from "src/raiting/entitys/raiting.entity";
import { Movie } from "src/movie/entitys/movie.entity";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";


@Injectable()
export class UserService {
    constructor(
        @InjectModel(User)
        private readonly userRepo: typeof User,
        private readonly movieService: MovieService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ){}

    async findAll(): Promise<User[]>  {
        return await this.userRepo.findAll()
    }
    
    async create(dto: AuthCreateDTO, options?: CreateOptions): Promise<User> {
        return await this.userRepo.create(dto as UserCreationAttributes, options); 
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.userRepo.findOne({ where: { username: username } })
    }

    async findById(id: number): Promise<User> {
        const user: User | null = await this.userRepo.findOne({where: { id: id }})

        if (!user) throw new BadRequestException(`Пользователя с id ${id} нет.`)

        return user
    }

    async findByIdWithRaitings(id: number): Promise<User> {
        const user: User | null = await this.userRepo.findOne({where: { id: id }, include: {
            model: Raiting,
            include: [Movie]
        }})

        if (!user) throw new BadRequestException(`Пользователя с id ${id} нет.`)

        return user
    }

    getSimmilarityUserRaitings(first_user_raitings: Raiting[], second_user_raitings: Raiting[]) {
        // В one_user_raitings, second_user_raitings - в raiting обязательно должно быть поле
        // movie, то есть при получение raiting нужно делать include: [Movie]!

        // В ланном алгоритме используется коссинусовое сходство
        if (first_user_raitings.length == 0 || second_user_raitings.length == 0) return 0

        const one_user_raiting_movies = first_user_raitings.reduce((acc, raiting: Raiting) => {
            acc[raiting.movie.title] = raiting.raiting
            return acc
        }, {})
        const second_user_raiting_movies = second_user_raitings.reduce((acc, raiting: Raiting) => {
            acc[raiting.movie.title] = raiting.raiting
            return acc
        }, {})

        const allMovies = new Set([...Object.keys(one_user_raiting_movies), ...Object.keys(second_user_raiting_movies)])

        let resonans_interests = 0
        
        let vectorPowerOneUser = 0
        let vectorPowerSecondUser = 0

        for (let movie of allMovies) {
            resonans_interests += (one_user_raiting_movies[movie] || 0) * (second_user_raiting_movies[movie] || 0)
            vectorPowerOneUser += (one_user_raiting_movies[movie] || 0) ** 2
            vectorPowerSecondUser += (second_user_raiting_movies[movie] || 0) ** 2
        }

        return resonans_interests / (Math.sqrt(vectorPowerOneUser) * Math.sqrt(vectorPowerSecondUser))
    }

    getCurrentUsersSimmilarity(current_user: User, all_users: User[]): Record<number, number> {
        const similaritie_users = all_users.reduce((acc, user) => {
                const similarity = this.getSimmilarityUserRaitings(current_user.raitings, user.raitings);
                
                if (similarity > 0.5) {
                    acc[user.id] = similarity;
                }
                
                return acc;
            }, {} as Record<number, number>);

        if (Object.keys(similaritie_users).length == 0 ) throw new BadRequestException('Рекомендаций нет')  
        return similaritie_users
    }

    getUserRatedMovies(user: User): Movie[] {
        const raitings = user.raitings
        return raitings.map((raiting) => raiting.movie)
    }

    async getBestUniqUsersMovies(current_user_movie_strings: string[], best_user_ids: number[]): Promise<Movie[]>  {
        const bestUsers: User[] = await this.userRepo.findAll({
            where: {
                id: best_user_ids
            },
            include: {
                model: Raiting,
                include: [Movie]
            }
        })

        const movies: Movie[] = bestUsers.flatMap(user =>
            user.raitings
                .map(r => r.movie)
                .filter(m => !current_user_movie_strings.includes(m.title))
        )

        const uniqueMovies = [
            ...new Map(movies.map(movie => [movie.title, movie])).values()
        ];

        return uniqueMovies
    }

    async getUserRecommendations(user_id: number) {
        const CACHE_TTL = 60000;
        const CACHE_KEY = `user_rec:${user_id}`

        const cached: Movie[] | undefined = await this.cacheManager.get<Movie[]>(CACHE_KEY)
        if (cached) return cached

        const currentUser: User = await this.findByIdWithRaitings(user_id)
        
        const otherUsers: User[] | undefined = await this.userRepo.findAll({
            where: {
                id: {
                    [Op.ne]: user_id
                }
            },
            include: {
                model: Raiting,
                include: [Movie]
            },
            limit: 1000
        })
        if (!otherUsers) return []

        let similaritie_users = this.getCurrentUsersSimmilarity(currentUser, otherUsers)

        const bestUserIds: number[] = Object.keys(similaritie_users).map(Number)
        const currentUserMovieStrings = currentUser.raitings.map((raiting) => raiting.movie.title)
        let recMovies: Movie[] = await this.getBestUniqUsersMovies(currentUserMovieStrings, bestUserIds)

        if (recMovies.length == 0) {
            recMovies = await this.movieService.getBestMovies(5)
        }

        await this.cacheManager.set(CACHE_KEY, recMovies, CACHE_TTL)

        return recMovies
    }
}