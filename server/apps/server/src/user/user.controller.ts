import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import type { UserLogin, UserRegister, Token } from "@en/common/user/index"
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  // 登录
  @Post('login')
  login(@Body() createUserDto: UserLogin) {
    return this.userService.login(createUserDto);
  }

  // 注册
  @Post('register')
  register(@Body() createUserDto: UserRegister) {
    return this.userService.register(createUserDto);
  }

  // 刷新token
  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: Omit<Token, 'accessToken'>) {
    return this.userService.refreshToken(refreshTokenDto);
  }

  //文件上传 参考：https://docs.nestjs.com/techniques/file-upload
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file')) //限制前端的key必须是file
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadAvatar(file);
  }

}
