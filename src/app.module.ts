import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UserApp } from './user/user.module';
import { AuthApp } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { jwtSalt } from './constanst';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config'
import config from './app.config'
import { DatabaseConfig } from './app.interface'
import { User } from './user/entitys/user.entity';
import { Role } from './user/entitys/role.entity';
import { MovieApp } from './movie/movie.module';
import { Movie } from './movie/entitys/movie.entity';
import { Genre } from './movie/entitys/genre.entity';
import { MovieGenre } from './movie/entitys/movieGener.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config]
    }),
    SequelizeModule.forRootAsync( {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.getOrThrow<DatabaseConfig>('database')
        return {
          dialect: dbConfig.provider,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.db_name,
          models: [User, Role, Movie, Genre, MovieGenre],
          autoLoadModels: true,
          synchronize: true
        }
      }
    }
  ),
    JwtModule.register({
      global: true,
      secret: jwtSalt,
      signOptions: { expiresIn: '1h' },
    }),
    UserApp,
    AuthApp,
    MovieApp
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ]
})
export class AppModule {}
