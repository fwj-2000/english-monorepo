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
}