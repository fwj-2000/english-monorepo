import type { TokenPayload } from "@en/common/user";

/**
 * 添加用户信息到请求对象中
 */

declare module "express" {
  interface Request {
    user: TokenPayload
  }
}