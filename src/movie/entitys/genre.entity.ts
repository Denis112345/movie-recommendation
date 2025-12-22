import { BelongsToMany, Model } from "sequelize-typescript";
import { Column, DataType, PrimaryKey, Table } from "sequelize-typescript";
import { Movie } from "./movie.entity";
import { MovieGenre } from "./movieGener.entity";
import { CreationAttributes } from "sequelize";


@Table
export class Genre extends Model<Genre> {
    @PrimaryKey
    @Column({ type: DataType.INTEGER, autoIncrement: true })
    declare id: number

    @Column({
        type: DataType.STRING,
        validate: {
            len: [5, 100]
        }
    })
    declare title: string

    @BelongsToMany(() => Movie, () => MovieGenre)
    movies: Movie[]
}

export type GenreCreationAttributes = CreationAttributes<Genre>