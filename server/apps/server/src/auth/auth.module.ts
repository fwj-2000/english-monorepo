import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SharedModule } from '@libs/shared';

@Module({
  providers: [AuthService],
  exports: [AuthService],// 提供给user模块使用,use.module.ts 中的imports引入AuthModule,就可以使用AuthService了
  imports: [SharedModule],// 使用SharedModule中的jwtserver
})
export class AuthModule { }
