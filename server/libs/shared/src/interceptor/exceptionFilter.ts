import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
// @Catch() 表示处理所有异常处理
// 希望只处理http强求异常
@Catch(HttpException)
export class InterceptorExceptionFilter<T extends HttpException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    response.status(exception.getStatus()).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      code: exception.getStatus(),
      success: false
    });
  }
}
