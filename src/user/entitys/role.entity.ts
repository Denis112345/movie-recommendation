import { Model, Column, DataType, PrimaryKey, Table, HasMany } from "sequelize-typescript";
import { User } from "./user.entity";


@Table
export class Role extends Model<Role> {
    @PrimaryKey
    @Column({ type: DataType.INTEGER, autoIncrement: true })
    declare id: number

    @Column({
        type: DataType.STRING,
        validate: {
            len: [5, 100]
        }
    })
    title: string

    @HasMany(() => User)
    users: User[]
}