import { Module } from "@nestjs/common";
import { DBModule } from "src/database/database.module";
import { UserService } from "./user.service";
import { UserProviders } from "./user.providers";
import { UserController } from "./user.controller";


@Module({
    imports: [DBModule],
    exports: [UserService],
    providers: [UserService, ...UserProviders],
    controllers: [UserController]
})
export class UserApp {};