import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserApp } from './user/user.module';
import { AuthApp } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 30001,
      username: 'movie',
      password: 'movie',
      database: 'movie',
      autoLoadModels: true,
      synchronize: true,
    }),
    UserApp,
    AuthApp,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
