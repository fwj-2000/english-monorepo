import { Module } from '@nestjs/common';
import { ResponseService } from './response.service';

@Module({
  exports: [ResponseService],//暴露服务 供业务文件用
  providers: [ResponseService]
})
export class ResponseModule { }
