import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { SharedModule } from '@libs/shared';
import { WorkBookModule } from './work-book/work-book.module';

@Module({
  imports: [UserModule, SharedModule, WorkBookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
