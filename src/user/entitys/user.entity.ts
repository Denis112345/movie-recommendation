import { CreationAttributes } from 'sequelize';
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';

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
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare updatedAt: Date;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date;
}

export type UserCreationAttributes = CreationAttributes<User>;