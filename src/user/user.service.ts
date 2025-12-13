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

    findAll(): Promise<User[]>  {
        return this.userRepo.findAll()
    }
    
    create(dto: AuthCreateDTO, options?: CreateOptions): Promise<User> {
        return this.userRepo.create(dto as UserCreationAttributes, options); 
    }

}