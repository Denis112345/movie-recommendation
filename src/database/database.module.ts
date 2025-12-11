import { Module } from "@nestjs/common";
import { DBProviders } from "./database.providers";


@Module({
    providers: [...DBProviders],
    exports: [...DBProviders],
})
export class DBModule {};