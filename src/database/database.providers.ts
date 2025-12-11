import { Sequelize } from 'sequelize-typescript';
import { User } from '../user/entitys/user.entity';

export const DBProviders = [
    {
        provide: 'SEQUELIZE',
        useFactory: async () => {
            const sequelize = new Sequelize({
                dialect: 'postgres',
                host: 'localhost',
                port: 30001,
                username: 'movie',
                password: 'movie',
                database: 'movie'
            });
            sequelize.addModels([User]);
            await sequelize.sync();
            return sequelize;
        },
    },
];
