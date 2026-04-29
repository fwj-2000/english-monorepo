import { Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';
import type { Prisma } from '@libs/shared/generated/prisma/client';
import type { UserLogin, UserRegister, ResultUser } from "@en/common/user/index"
type UserSelectWithoutPassword = Omit<Prisma.UserSelect, 'password'>;
const newSelect: UserSelectWithoutPassword = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  avatar: true,
  lastLoginAt: true,
  wordNumber: true,
  dayNumber: true,
  createdAt: true,
  updatedAt: true,
}
@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService, private readonly response: ResponseService) {
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
    return this.response.success(updateUser);
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
    return this.response.success(userRes);
  }

}
