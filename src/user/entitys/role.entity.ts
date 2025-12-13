import { Model, Column, DataType, PrimaryKey, Table } from "sequelize-typescript";


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
    
}