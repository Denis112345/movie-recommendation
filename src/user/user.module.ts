import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { User } from "./entitys/user.entity";
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
    imports: [SequelizeModule.forFeature([User])],
    exports: [UserService],
    providers: [UserService],
    controllers: [UserController]
})
export class UserApp {};