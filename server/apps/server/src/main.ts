import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { InterceptorInterceptor } from '@libs/shared/interceptor/interceptor';
import { InterceptorExceptionFilter } from '@libs/shared/interceptor/exceptionFilter';
import { Config } from '@en/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new InterceptorInterceptor());
  app.useGlobalFilters(new InterceptorExceptionFilter());
  app.setGlobalPrefix('api');//全局路由前缀，例如：/api/xxx
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });//版本号设置到url中，例如：/api/v1/xxx
  // 页面上访问接口就是 http://localhost:3000/api/v1/xxxxxxx
  await app.listen(Config.ports.server);
  console.log('✅ Nest server 服务启动成功！',);
}
bootstrap();
