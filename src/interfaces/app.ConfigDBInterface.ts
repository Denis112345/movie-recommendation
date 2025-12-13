import { Dialect } from "sequelize"


export default interface DatabaseConfig {
    port: number,
    host: string,
    db_name: string,
    username: string,
    password: string,
    provider: Dialect,
}