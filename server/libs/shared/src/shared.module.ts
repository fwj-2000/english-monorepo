import { Module, Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { ResponseModule } from './response/response.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioModule } from './minio/minio.module';
import { PayModule } from './pay/pay.module';
import { EmailModule } from './email/email.module';
import { BullModule } from '@nestjs/bullmq'

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
    // https://docs.bullmq.io/guide/nestjs
    // https://docs.nestjs.cn/techniques/queues/#%E5%BC%82%E6%AD%A5%E9%85%8D%E7%BD%AE
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({

        connection: {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
          password: configService.get('REDIS_PASSWORD') || undefined,
          // 强制 IPv4，防止 Windows 上 localhost 解析为 IPv6 导致 ECONNRESET
          family: 4,
          // BullMQ 要求关闭 ioredis 内置重试，由 BullMQ 自行管理重连
          maxRetriesPerRequest: null,
          connectTimeout: 10000,
          retryStrategy(times) {
            console.log("🚀 ~ times:", times)

            // 最多重试 10 次，间隔递增（1s → 2s → 4s ... 最大 30s）
            if (times > 10) return null // 停止重试
            return Math.min(times * 1000, 30000)
          },
        },

      }),
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
