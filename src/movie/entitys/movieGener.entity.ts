import { Model } from "sequelize-typescript";
import { Column, DataType, ForeignKey, PrimaryKey, Table } from "sequelize-typescript";
import { Movie } from "./movie.entity";
import { Genre } from "./genre.entity";

@Table
export class MovieGenre extends Model<MovieGenre> {
    @PrimaryKey
    @Column({ type: DataType.INTEGER, autoIncrement: true })
    declare id: number

    @ForeignKey(() => Movie)
    @Column({ type: DataType.INTEGER })
    movie_id: number

    @ForeignKey(() => Genre)
    @Column({ type: DataType.INTEGER })
    genre_id: number
}