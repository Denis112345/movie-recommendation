import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UserApp } from "src/user/user.module";


@Module({
    imports: [UserApp],
    controllers: [AuthController]
})
export class AuthApp {}