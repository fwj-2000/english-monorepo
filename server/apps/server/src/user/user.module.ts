import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [AuthModule], // 导入auth模块，因为user模块需要用到auth模块中的jwt策略
})
export class UserModule { }
