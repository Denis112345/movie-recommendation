import { CreationAttributes } from 'sequelize';
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Role } from './role.entity';
import { Raiting } from 'src/raiting/entitys/raiting.entity';

@Table
export class User extends Model<User> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING })
  username!: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updatedAt: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date;

  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER })
  role_id: number

  @BelongsTo(() => Role)
  role: Role

  @HasMany(() => Raiting)
  raitings: Raiting[]
}

export type UserCreationAttributes = CreationAttributes<User>;