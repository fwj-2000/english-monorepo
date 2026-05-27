import { Module, Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { ResponseModule } from './response/response.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioModule } from './minio/minio.module';
import { PayModule } from './pay/pay.module';
import { EmailModule } from './email/email.module';

@Global()
@Module({
  providers: [SharedService],
  exports: [SharedService, PrismaModule, ResponseModule, JwtModule, ConfigModule, MinioModule, PayModule, EmailModule],
  imports: [
    PrismaModule,
    ResponseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get('SECRET_KEY'), //秘钥
        signOptions: { expiresIn: 10 }, //10秒过期 这里方便测试  生产环境正常就是7天 7d
      }),
      inject: [ConfigService],
    }),
    MinioModule,
    PayModule,
    EmailModule
  ],
})
export class SharedModule { }
