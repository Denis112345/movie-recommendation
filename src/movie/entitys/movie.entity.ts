import { BelongsToMany, Model } from "sequelize-typescript";
import { Column, DataType, ForeignKey, PrimaryKey, Table } from "sequelize-typescript";
import { Genre } from "./genre.entity";
import { MovieGenre } from "./movieGener.entity";
import { CreationAttributes } from "sequelize";


@Table
export class Movie extends Model<Movie> {
    @PrimaryKey
    @Column({ type: DataType.INTEGER, autoIncrement: true})
    declare id: number

    @Column({
        type: DataType.STRING,
        validate: {
            len: [2, 300]
        }
    })
    title: string

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    description?: string

    @Column({
        type: DataType.INTEGER,
        validate: {
            isValideYear(year: number) {
                if (year < 1000 && year > 2100) {
                    throw new Error('Не может быть такого года')
                }
            }
        }
    })
    releaseYear: number

    @BelongsToMany(() => Genre, () => MovieGenre)
    genres: Genre[]

    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    declare updatedAt: Date;

    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    declare createdAt: Date;

    @Column({type: DataType.FLOAT, defaultValue: 0.0})
    raiting: number 
}

export type MovieCreationAttribute = CreationAttributes<Movie> 