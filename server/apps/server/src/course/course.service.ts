import { Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared'

@Injectable()
export class CourseService {

  constructor(readonly prisma: PrismaService, readonly response: ResponseService) { }
  async findAll() {
    const course = await this.prisma.course.findMany()
    const list = course.map(item => {
      return {
        ...item,
        price: Number(item.price.toFixed(2)),
      }
    })
    return this.response.success(list)
  }

}