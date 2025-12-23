import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { User, UserCreationAttributes } from "./entitys/user.entity";
import { AuthCreateDTO } from "../auth/dto/auth.createDto";
import { InjectModel } from "@nestjs/sequelize";
import { CreateOptions, Op } from "sequelize";
import { MovieService } from "src/movie/movie.service";
import { Raiting } from "src/raiting/entitys/raiting.entity";
import { Movie } from "src/movie/entitys/movie.entity";
import { includes } from "zod";
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

    async findById(id: number): Promise<User | null> {
        return await this.userRepo.findOne({ where: { id: id } })
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

    getUserRatedMovies(user: User): Movie[] {
        const raitings = user.raitings
        return raitings.map((raiting) => raiting.movie)
    }

    async getUserRecommendations(user_id: number) {
        const cache_key = `user_rec:${user_id}`
        const cached: number | undefined = await this.cacheManager.get(cache_key)
        if (cached) return cached

        const current_user: User | null = await this.userRepo.findOne({where: { id: user_id }, include: {
            model: Raiting,
            include: [Movie]
        }})
        if (!current_user) throw new BadRequestException('Пользователя для рекомендаций нет')

        const all_users: User[] | undefined = await this.userRepo.findAll({where: {
            id: {
                [Op.ne]: user_id
            }
        }, include: {
            model: Raiting,
            include: [Movie]
        }})
        if (!all_users) throw new BadRequestException('Пользователей нет для поиска рекомендаций')

        
        let user_similarities = all_users.map((user) => {
            const current_user_raitings = current_user.raitings
            const user_raitings = user.raitings
            return {[user.id]: this.getSimmilarityUserRaitings(current_user_raitings, user_raitings)}
        })

        user_similarities = user_similarities.sort((a, b) => {
            const valA = Object.values(a)[0] as number;
            const valB = Object.values(b)[0] as number;
            return valB - valA
        }).filter((a) => { return Object.values(a)[0] > 0.5 })

        if (user_similarities.length == 0 ) throw new BadRequestException('Рекомендаций нет')

        const current_user_movie_strings = current_user.raitings.map((raiting) => raiting.movie.title)

        let rec_movies: Movie[] = []

        const best_user_ids: number[] = user_similarities.map((user_similaritie) => {
            return +Object.keys(user_similaritie)[0]
        })


        for (let user_id of best_user_ids) {
            const best_user: User | null = await this.userRepo.findOne({where: { id: user_id }, include: {
                model: Raiting,
                include: [Movie]
            }})

            if (!best_user) throw new BadRequestException('Нет такого пользователя')
            
            rec_movies.push(...best_user.raitings.map((raiting) => raiting.movie).filter((movie) => {
                return !current_user_movie_strings.includes(movie.title)
            }))
        }

        const uniqueMovies = [
            ...new Map(rec_movies.map(movie => [movie.title, movie])).values()
        ];

        this.cacheManager.set(cache_key, uniqueMovies, 60000)

        return uniqueMovies
    }
}