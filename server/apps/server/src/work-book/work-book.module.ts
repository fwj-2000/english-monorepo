import { Module } from '@nestjs/common';
import { WorkBookService } from './work-book.service';
import { WorkBookController } from './work-book.controller';

@Module({
  controllers: [WorkBookController],
  providers: [WorkBookService],
})
export class WorkBookModule {}
