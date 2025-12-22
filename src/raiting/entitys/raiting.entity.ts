import { CreationAttributes } from "sequelize";
import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Movie } from "src/movie/entitys/movie.entity";
import { User } from "src/user/entitys/user.entity";


@Table
export class Raiting extends Model<Raiting> {
    @PrimaryKey
    @Column({ type: DataType.INTEGER, autoIncrement: true })
    declare id: number

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER })
    declare user_id: number

    @ForeignKey(() => Movie)
    @Column({ type: DataType.INTEGER })
    declare movie_id: number

    @Column({ type: DataType.INTEGER, validate: {
        min: 1,
        max: 5,
    } })
    declare raiting: number

    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    declare createdAt: Date

    @BelongsTo(() => User)
    user: User

    @BelongsTo(() => Movie)
    movie: Movie
}

export type RaitingCreationAttributes = CreationAttributes<Raiting>