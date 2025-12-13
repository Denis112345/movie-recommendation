import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UserApp } from './user/user.module';
import { AuthApp } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { jwtSalt } from './constanst';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { Public } from './decorators/app.public';

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
    JwtModule.register({
      global: true,
      secret: jwtSalt,
      signOptions: { expiresIn: '1h' },
    }),
    UserApp,
    AuthApp,
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
