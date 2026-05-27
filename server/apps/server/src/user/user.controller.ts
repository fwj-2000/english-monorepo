import { Controller, Post, Body, UploadedFile, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import type { UserLogin, UserRegister, Token, UserUpdate  } from "@en/common/user/index"
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
import type { Request } from 'express';
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

  /**
   * 
   * @param updateUserDto 前端传递的要修改信息
   * @param req 无需前端传userid,利用守卫获取
   * @returns 
   */
  @Post('update-user')
  @UseGuards(AuthGuard)
  updateUser(@Body() updateUserDto: UserUpdate, @Req() req: Request) {
    const user = req.user
    return this.userService.updateUser(updateUserDto, user);
  }

}
