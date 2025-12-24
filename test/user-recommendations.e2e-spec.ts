import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Sequelize } from 'sequelize-typescript';
import { getConnectionToken } from '@nestjs/sequelize';
import { User } from '../src/user/entitys/user.entity';
import { Movie } from '../src/movie/entitys/movie.entity';
import { Raiting } from '../src/raiting/entitys/raiting.entity';
import { Genre } from '../src/movie/entitys/genre.entity';
import { Role } from '../src/user/entitys/role.entity';
import { JwtService } from '@nestjs/jwt';

describe('User Recommendations E2E Tests', () => {
  let app: INestApplication;
  let sequelize: Sequelize;
  let transaction: any;
  let jwtService: JwtService;
  let createdUserIds: number[] = [];
  let createdMovieIds: number[] = [];
  let createdRoleIds: number[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    sequelize = app.get<Sequelize>(getConnectionToken());
    jwtService = app.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    // Начинаем транзакцию для изоляции тестовых данных
    transaction = await sequelize.transaction();
    // Очищаем массивы для отслеживания созданных записей
    createdUserIds = [];
    createdMovieIds = [];
    createdRoleIds = [];
  });

  afterEach(async () => {
    // Откатываем транзакцию после каждого теста, если она еще активна
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    transaction = null;

    // Очищаем тестовые данные после каждого теста
    // Удаляем в обратном порядке из-за внешних ключей
    if (createdUserIds.length > 0) {
      await Raiting.destroy({
        where: { user_id: createdUserIds },
        force: true,
      });
    }
    if (createdMovieIds.length > 0) {
      await Raiting.destroy({
        where: { movie_id: createdMovieIds },
        force: true,
      });
      await Movie.destroy({
        where: { id: createdMovieIds },
        force: true,
      });
    }
    if (createdUserIds.length > 0) {
      await User.destroy({
        where: { id: createdUserIds },
        force: true,
      });
    }
    if (createdRoleIds.length > 0) {
      await Role.destroy({
        where: { id: createdRoleIds },
        force: true,
      });
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /user/:id/recommendations', () => {
    it('должен возвращать рекомендации для пользователя с похожими вкусами', async () => {
      // Создаем тестовые данные в транзакции
      const role = await Role.create({
        title: 'Тестовый пользователь',
      } as any, { transaction });

      if (!role || !role.id) {
        throw new Error('Роль не создана');
      }
      createdRoleIds.push(role.id);

      const user1 = await User.create({
        username: 'test_user1_e2e',
        email: 'test1_e2e@test.com',
        password: 'password',
        role_id: role.id,
      } as any, { transaction });
      createdUserIds.push(user1.id);

      const user2 = await User.create({
        username: 'test_user2_e2e',
        email: 'test2_e2e@test.com',
        password: 'password',
        role_id: role.id,
      } as any, { transaction });
      createdUserIds.push(user2.id);

      const user3 = await User.create({
        username: 'test_user3_e2e',
        email: 'test3_e2e@test.com',
        password: 'password',
        role_id: role.id,
      } as any, { transaction });
      createdUserIds.push(user3.id);

      const movie1 = await Movie.create({
        title: 'Фильм 1',
        description: 'Описание 1',
        releaseYear: 2020,
      } as any, { transaction });
      createdMovieIds.push(movie1.id);

      const movie2 = await Movie.create({
        title: 'Фильм 2',
        description: 'Описание 2',
        releaseYear: 2021,
      } as any, { transaction });
      createdMovieIds.push(movie2.id);

      const movie3 = await Movie.create({
        title: 'Фильм 3',
        description: 'Описание 3',
        releaseYear: 2022,
      } as any, { transaction });
      createdMovieIds.push(movie3.id);

      const movie4 = await Movie.create({
        title: 'Фильм 4',
        description: 'Описание 4',
        releaseYear: 2023,
      } as any, { transaction });
      createdMovieIds.push(movie4.id);

      // user1 оценил movie1 и movie2 (похожие вкусы с user2)
      await Raiting.create({
        user_id: user1.id,
        movie_id: movie1.id,
        raiting: 5,
      } as any, { transaction });

      await Raiting.create({
        user_id: user1.id,
        movie_id: movie2.id,
        raiting: 4,
      } as any, { transaction });

      // user2 оценил movie1, movie2 и movie3 (похожие вкусы с user1)
      await Raiting.create({
        user_id: user2.id,
        movie_id: movie1.id,
        raiting: 5,
      } as any, { transaction });

      await Raiting.create({
        user_id: user2.id,
        movie_id: movie2.id,
        raiting: 4,
      } as any, { transaction });

      await Raiting.create({
        user_id: user2.id,
        movie_id: movie3.id,
        raiting: 5,
      } as any, { transaction });

      // user3 оценил movie4 (другие вкусы)
      await Raiting.create({
        user_id: user3.id,
        movie_id: movie4.id,
        raiting: 3,
      } as any, { transaction });

      // Завершаем транзакцию перед запросом
      await transaction.commit();
      transaction = null; // Помечаем транзакцию как завершенную

      // Создаем JWT токен для аутентификации
      const token = await jwtService.signAsync({ sub: user1.id, username: user1.username });

      // Делаем запрос с токеном
      const response = await request(app.getHttpServer())
        .get(`/user/${user1.id}/recommendations`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Проверяем результат
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Должен быть рекомендован movie3 (который оценил user2 с похожими вкусами)
      const recommendedTitles = response.body.map((m: any) => m.title);
      expect(recommendedTitles).toContain('Фильм 3');
    });

    it('должен выбрасывать ошибку если у пользователя нет оценок', async () => {
      const role = await Role.create({
        title: 'Тестовый пользователь 2',
      } as any, { transaction });

      if (!role || !role.id) {
        throw new Error('Роль не создана');
      }
      createdRoleIds.push(role.id);

      const user = await User.create({
        username: 'user_no_ratings_e2e',
        email: 'no_ratings_e2e@test.com',
        password: 'password',
        role_id: role.id,
      } as any, { transaction });
      createdUserIds.push(user.id);

      await transaction.commit();
      transaction = null;

      // Создаем JWT токен для аутентификации
      const token = await jwtService.signAsync({ sub: user.id, username: user.username });

      await request(app.getHttpServer())
        .get(`/user/${user.id}/recommendations`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('должен выбрасывать ошибку если нет похожих пользователей', async () => {
      const role = await Role.create({
        title: 'Тестовый пользователь 3',
      } as any, { transaction });

      if (!role || !role.id) {
        throw new Error('Роль не создана');
      }
      createdRoleIds.push(role.id);

      const user1 = await User.create({
        username: 'isolated_user_e2e',
        email: 'isolated_e2e@test.com',
        password: 'password',
        role_id: role.id,
      } as any, { transaction });
      createdUserIds.push(user1.id);

      const movie1 = await Movie.create({
        title: 'Уникальный фильм',
        description: 'Описание',
        releaseYear: 2020,
      } as any, { transaction });
      createdMovieIds.push(movie1.id);

      await Raiting.create({
        user_id: user1.id,
        movie_id: movie1.id,
        raiting: 5,
      } as any, { transaction });

      await transaction.commit();
      transaction = null;

      // Создаем JWT токен для аутентификации
      const token = await jwtService.signAsync({ sub: user1.id, username: user1.username });

      await request(app.getHttpServer())
        .get(`/user/${user1.id}/recommendations`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });
});

