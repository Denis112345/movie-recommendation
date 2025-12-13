import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Sequelize } from 'sequelize-typescript';
import { getConnectionToken } from '@nestjs/sequelize';

async function startApp() {
  const app = await NestFactory.create(AppModule);
  
  // Синхронизация базы данных с опцией alter для добавления новых колонок
  const sequelize = app.get<Sequelize>(getConnectionToken());
  await sequelize.sync({ alter: true });
  
  await app.listen(process.env.PORT ?? 3000);
}
startApp();
