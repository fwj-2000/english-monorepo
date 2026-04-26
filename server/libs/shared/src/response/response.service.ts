import { Injectable } from '@nestjs/common';
// 每个业务文件都会用，如果user文件想用：用以下步骤
/**
 * user 文件的module 中引入 response.module
 * user文件中的 service 中引入 response.service
 *  */
@Injectable()
export class ResponseService {
  success(data: any, message: string = '操作成功', code: number = 200) {
    return {
      data,
      code,
      message,
    };
  }
  error(message: string = '操作失败', code: number = 200) {
    return {
      code,
      message,
    };
  }
}
