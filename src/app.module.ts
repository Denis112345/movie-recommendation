import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserApp } from './user/user.module';

@Module({
  imports: [UserApp],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
