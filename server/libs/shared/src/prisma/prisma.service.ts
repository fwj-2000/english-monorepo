import { Injectable } from '@nestjs/common';
// import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    const dataBaseUrl = configService.get('DATABASE_URL');
    const adapter = new PrismaPg({ connectionString: dataBaseUrl });//  new PrismaPg({ connectionString: process.env.DATABASE_URL });
    console.log(dataBaseUrl, '数据库连接字符串');
    super({ adapter });
  }

}
