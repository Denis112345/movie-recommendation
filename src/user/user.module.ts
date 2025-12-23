import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { User } from "./entitys/user.entity";
import { SequelizeModule } from '@nestjs/sequelize';
import { MovieApp } from "src/movie/movie.module";

@Module({
    imports: [SequelizeModule.forFeature([User]), MovieApp],
    exports: [UserService],
    providers: [UserService],
    controllers: [UserController]
})
export class UserApp {};