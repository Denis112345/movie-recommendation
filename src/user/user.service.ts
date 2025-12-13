import { Injectable } from "@nestjs/common";
import { User, UserCreationAttributes } from "./entitys/user.entity";
import { AuthCreateDTO } from "../auth/dto/auth.createDto";
import { InjectModel } from "@nestjs/sequelize";
import { CreateOptions } from "sequelize";


@Injectable()
export class UserService {
    constructor(
        @InjectModel(User)
        private userRepo: typeof User
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

}