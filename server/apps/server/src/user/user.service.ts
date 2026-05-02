import { Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';
import type { Prisma } from '@libs/shared/generated/prisma/client'; //  导入 Prisma 客户端类型定义
import type { UserLogin, UserRegister, ResultUser, Token, RefreshTokenPayload } from "@en/common/user/index"
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { newSelect } from './user.select';

import { MinioService } from '@libs/shared/minio/minio.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly response: ResponseService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly minioService: MinioService
  ) {
  }

  async login(createUserDto: UserLogin) {
    // 1. 检查手机号是否在数据库中存在
    const user = await this.prismaService.user.findUnique({
      where: { phone: createUserDto.phone }
    });
    // 2. 检查手机号对应密码是否正确
    if (!user || user.password !== createUserDto.password) {
      return this.response.error(null, '手机号或者密码不对');
    }
    // 3. 更新用户最后登录时间
    const updateUser = await this.prismaService.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      select: newSelect
    })
    //  4. 生成token 返回用户信息和token
    const token = this.authService.generateToken({
      userId: updateUser.id,
      name: updateUser.name,
      email: updateUser.email
    });
    return this.response.success({ ...updateUser, token });
  }

  async register(createUserDto: UserRegister) {

    const newUser: Prisma.UserCreateInput = {
      phone: createUserDto.phone,
      password: createUserDto.password,
      name: createUserDto.name,
      lastLoginAt: new Date(),
    }
    //1. 手机号必填 且唯一 
    const user = await this.prismaService.user.findUnique({
      where: { phone: createUserDto.phone }
    });
    if (user) {
      return this.response.error(null, '手机号已被注册');
    }

    // 2. 邮箱不必填 数据库唯一
    if (createUserDto.email) {
      const emailUser = await this.prismaService.user.findUnique({
        where: { email: createUserDto.email }
      });
      if (emailUser) {
        return this.response.error(null, '邮箱已被注册');
      }
      newUser.email = createUserDto.email;
    }

    // 3. 创建用户 密码不能返回出去 邮箱拿到上面去判断
    const userRes = await this.prismaService.user.create({
      data: newUser,
      select: newSelect
    })
    const tokens = this.authService.generateToken({
      userId: userRes.id,
      name: userRes.name,
      email: userRes.email
    });
    return this.response.success({ ...userRes, tokens });
  }

  async refreshToken(createUserDto: Omit<Token, 'accessToken'>) {
    //1. 验证refreshToken是否有效 verify检查token是否有效 并且返回解码后的数据 sign生成token
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(createUserDto.refreshToken);
      console.log('refreshToken decoded', decoded);

      //2.为什么增加这么一个判断 accessToken 冒充refreshToken 进行攻击
      if (decoded.tokenType !== 'refresh') return this.response.error(null, 'refreshToken已过期或无效');
      const user = await this.prismaService.user.findUnique({ where: { id: decoded.userId } })

      //3.如果查不出来说明userId是伪造的
      if (!user) return this.response.error(null, '用户不存在');
      const token = this.authService.generateToken({ userId: user.id, name: user.name, email: user.email });
      return this.response.success(token);
    }
    catch (error) {
      return this.response.error(null, 'refreshToken已过期或无效');
    }
  }

  async uploadAvatar(file: Express.Multer.File) {
    if (!file) {
      return this.response.error(null, '请选择文件');
    }
    if (file.size > 1024 * 1024 * 5) {
      return this.response.error(null, '文件大小不能超过5M');
    }
    // 获取minio客户端
    const client = this.minioService.getClient();
    // 获取bucket 就是上传到minio的那个目录下（一般叫做桶）
    const bucket = this.minioService.getBucket();
    // 获取资源名字 
    const fileName = `${Date.now()}-${file.originalname}`;
    // 上传minio中 putObject
    await client.putObject(bucket, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype
    });
    // 返回 文件地址 预览地址
    const isHttps = this.minioService.getIsHttps();
    const baseUrl = isHttps ? 'https' : 'http';
    const port = this.minioService.getPort();// 获取端口
    const databaseUrl = `${bucket}/${fileName}`;
    // databaseUrl  /avatar/xxxx.png
    const previewUrl = `${baseUrl}://${this.minioService.getEndpoint()}:${port}/${databaseUrl}`;
    // previewUrl  http://192.168.1.100:9000/avatar/xxxx.png
    return this.response.success({ databaseUrl, previewUrl });

  }

}
