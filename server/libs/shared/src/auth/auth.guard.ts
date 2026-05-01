import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import type { RefreshTokenPayload } from '@en/common/user';

//守卫 用于保护路由 给每一个接口增加携带token校验
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  canActivate(context: ExecutionContext,): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // 1. 安全获取请求头（可选链容错）
    const authHeaderToken = request.headers.authorization;

    // 2. 无token → 精准报错
    if (!authHeaderToken) throw new UnauthorizedException('请先登录，未携带token')

    // 3. 安全提取token（抽离方法 + 容错）
    const token = this.extractTokenFromHeader(authHeaderToken);
    if (!token) throw new UnauthorizedException('token格式不正确');

    try {
      // 4. 语义化类型（accessToken 专用）
      const decoded = this.jwtService.verify<RefreshTokenPayload>(token);

      // 5. 严格校验token类型（只允许accessToken）
      if (decoded.tokenType !== 'access') throw new UnauthorizedException('token类型错误，请勿使用刷新令牌');

      // 6. 挂载用户信息
      request.user = decoded;//payload里有用户信息 其他接口需要用到用户信息就可以直接从request.user里拿了
      return true;
    } catch (error) {
      // 7. 统一兜底报错
      throw new UnauthorizedException('token已过期或无效');
    }
  }

  private extractTokenFromHeader(authHeaderToken: string): string | undefined {
    const [type, token] = authHeaderToken.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
//因为不是所有的接口都需要增加token 按需的 login接口 register接口 公共接口 按需使用 哪个接口需要鉴权就给谁加
//web -> axios -> 请求 -> guard(通过之后) -> controller -> service -> xxxx -> response