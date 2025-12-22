import { BelongsToMany, HasMany, Model } from "sequelize-typescript";
import { Column, DataType, ForeignKey, PrimaryKey, Table } from "sequelize-typescript";
import { Genre } from "./genre.entity";
import { MovieGenre } from "./movieGener.entity";
import { CreationAttributes } from "sequelize";
import { Raiting } from "src/raiting/entitys/raiting.entity";


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
    declare title: string

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description?: string

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
    declare releaseYear: number

    @BelongsToMany(() => Genre, () => MovieGenre)
    genres: Genre[]

    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    declare updatedAt: Date;

    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    declare createdAt: Date;

    @HasMany(() => Raiting)
    declare Raitings: Raiting[]
}

export type MovieCreationAttribute = CreationAttributes<Movie> 