import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UserApp } from "src/user/user.module";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";


@Module({
    imports: [UserApp],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard],
    exports: [AuthGuard, AuthGuard]
})
export class AuthApp {};