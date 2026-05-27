import { NestFactory } from '@nestjs/core';
import { AiModule } from './ai.module';
import { Config } from '@en/config';
import { InterceptorInterceptor } from '@libs/shared/interceptor/interceptor';
import { InterceptorExceptionFilter } from '@libs/shared/interceptor/exceptionFilter';
import { VersioningType } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AiModule);
  app.useGlobalInterceptors(new InterceptorInterceptor());
  app.useGlobalFilters(new InterceptorExceptionFilter());
  app.setGlobalPrefix('ai');//全局路由前缀，例如：/api/xxx
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });//版本号设置到url中，例如：/ai/v1/xxx
  // 页面上访问接口就是 http://localhost:3000/ai/v1/xxxxxxx
  await app.listen(Config.ports.ai);
  console.log('✅ Nest ai 服务启动成功11！',);
}
bootstrap();
