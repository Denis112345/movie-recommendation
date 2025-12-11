import { Inject, Injectable } from "@nestjs/common";
import { User } from "./entitys/user.entity";
import { UserCreateDTO } from "./dto/user.createDto";


@Injectable()
export class UserService {
    constructor(
        @Inject('USERS_REPOSITORY')
        private userRepo: typeof User
    ){}

    findAll(): Promise<User[]>  {
        return this.userRepo.findAll()
    }
    
    create(dto: UserCreateDTO): Promise<User> {
        return this.userRepo.create()
    }
}