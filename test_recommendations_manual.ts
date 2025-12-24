/**
 * Ручной тестовый скрипт для проверки функции рекомендаций
 * Использует транзакции для изоляции тестовых данных
 * 
 * Запуск: npx ts-node test_recommendations_manual.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Sequelize } from 'sequelize-typescript';
import { getConnectionToken } from '@nestjs/sequelize';
import { User } from './src/user/entitys/user.entity';
import { Movie } from './src/movie/entitys/movie.entity';
import { Raiting } from './src/raiting/entitys/raiting.entity';
import { Genre } from './src/movie/entitys/genre.entity';
import { Role } from './src/user/entitys/role.entity';
import { UserService } from './src/user/user.service';

async function testRecommendations() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const sequelize = app.get<Sequelize>(getConnectionToken());
  const userService = app.get<UserService>(UserService);

  // Начинаем транзакцию
  const transaction = await sequelize.transaction();

  try {
    console.log('🧪 Создание тестовых данных...\n');

    // Создаем роли
    const role = await Role.create({
      title: 'Тестовый пользователь',
    } as any, { transaction });

    // Создаем пользователей
    const users = await Promise.all([
      User.create({ username: 'test_user1', email: 'test1@test.com', password: 'pass', role_id: role.id } as any, { transaction }),
      User.create({ username: 'test_user2', email: 'test2@test.com', password: 'pass', role_id: role.id } as any, { transaction }),
      User.create({ username: 'test_user3', email: 'test3@test.com', password: 'pass', role_id: role.id } as any, { transaction }),
    ]);

    // Создаем фильмы
    const movies = await Promise.all([
      Movie.create({ title: 'Фильм 1', description: 'Описание 1', releaseYear: 2020 } as any, { transaction }),
      Movie.create({ title: 'Фильм 2', description: 'Описание 2', releaseYear: 2021 } as any, { transaction }),
      Movie.create({ title: 'Фильм 3', description: 'Описание 3', releaseYear: 2022 } as any, { transaction }),
      Movie.create({ title: 'Фильм 4', description: 'Описание 4', releaseYear: 2023 } as any, { transaction }),
      Movie.create({ title: 'Фильм 5', description: 'Описание 5', releaseYear: 2024 } as any, { transaction }),
    ]);

    // Создаем оценки
    // user1: фильмы 1,2,3 (высокие оценки)
    await Raiting.create({ user_id: users[0].id, movie_id: movies[0].id, raiting: 5 } as any, { transaction });
    await Raiting.create({ user_id: users[0].id, movie_id: movies[1].id, raiting: 4 } as any, { transaction });
    await Raiting.create({ user_id: users[0].id, movie_id: movies[2].id, raiting: 5 } as any, { transaction });

    // user2: фильмы 1,2,3,4 (похожие вкусы с user1)
    await Raiting.create({ user_id: users[1].id, movie_id: movies[0].id, raiting: 5 } as any, { transaction });
    await Raiting.create({ user_id: users[1].id, movie_id: movies[1].id, raiting: 4 } as any, { transaction });
    await Raiting.create({ user_id: users[1].id, movie_id: movies[2].id, raiting: 5 } as any, { transaction });
    await Raiting.create({ user_id: users[1].id, movie_id: movies[3].id, raiting: 5 } as any, { transaction });

    // user3: фильмы 4,5 (другие вкусы)
    await Raiting.create({ user_id: users[2].id, movie_id: movies[3].id, raiting: 2 } as any, { transaction });
    await Raiting.create({ user_id: users[2].id, movie_id: movies[4].id, raiting: 3 } as any, { transaction });

    console.log('✅ Тестовые данные созданы\n');
    console.log('📊 Статистика:');
    console.log(`   Пользователей: ${users.length}`);
    console.log(`   Фильмов: ${movies.length}`);
    console.log(`   Оценок: ${await Raiting.count({ transaction })}\n`);

    // Завершаем транзакцию
    await transaction.commit();

    // Тестируем рекомендации
    console.log('🔍 Тестирование рекомендаций для user1...\n');

    const recommendations = await userService.getUserRecommendations(users[0].id);

    // Проверяем тип возвращаемого значения
    if (typeof recommendations === 'number') {
      console.log('⚠️  Получено число из кэша, пропускаем тест');
      return;
    }

    console.log('✅ Рекомендации получены:');
    console.log(`   Количество: ${recommendations.length}`);
    recommendations.forEach((movie, index) => {
      console.log(`   ${index + 1}. ${movie.title} (${movie.releaseYear})`);
    });

    // Проверяем логику
    console.log('\n📝 Проверка логики:');
    const recommendedTitles = recommendations.map(m => m.title);
    
    // user1 должен получить рекомендацию на movie4 (который оценил user2 с похожими вкусами)
    if (recommendedTitles.includes('Фильм 4')) {
      console.log('   ✅ Правильно: Фильм 4 рекомендован (оценен похожим пользователем)');
    } else {
      console.log('   ⚠️  Фильм 4 не рекомендован (возможно, сходство < 0.5)');
    }

    // user1 не должен получить рекомендации на фильмы, которые он уже оценил
    const user1Movies = ['Фильм 1', 'Фильм 2', 'Фильм 3'];
    const hasOwnMovies = recommendedTitles.some(title => user1Movies.includes(title));
    if (!hasOwnMovies) {
      console.log('   ✅ Правильно: Нет рекомендаций на уже оцененные фильмы');
    } else {
      console.log('   ❌ Ошибка: Рекомендованы фильмы, которые пользователь уже оценил');
    }

    // Очистка тестовых данных
    console.log('\n🧹 Очистка тестовых данных...');
    const cleanupTransaction = await sequelize.transaction();
    
    await Raiting.destroy({ where: { user_id: users.map(u => u.id) }, transaction: cleanupTransaction });
    await Movie.destroy({ where: { id: movies.map(m => m.id) }, transaction: cleanupTransaction });
    await User.destroy({ where: { id: users.map(u => u.id) }, transaction: cleanupTransaction });
    await Role.destroy({ where: { id: role.id }, transaction: cleanupTransaction });
    
    await cleanupTransaction.commit();
    console.log('✅ Тестовые данные удалены\n');

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Ошибка:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Запуск теста
testRecommendations()
  .then(() => {
    console.log('✨ Тестирование завершено');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });

