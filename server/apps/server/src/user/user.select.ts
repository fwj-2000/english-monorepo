import type { Prisma } from '@libs/shared/generated/prisma/client';
type UserSelectWithoutPassword = Omit<Prisma.UserSelect, 'password'>;
export const newSelect: UserSelectWithoutPassword = {
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
  bio: true, //签名 第七集新增
  isTimingTask: true, //是否开启定时任务 第七集新增
  timingTaskTime: true, //定时任务时间 第七集新增
}