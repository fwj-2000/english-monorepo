import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CourseService } from './course.service';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
import type { Request } from 'express';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @Get('list')
  findAll() {
    return this.courseService.findAll();
  }

  // 获取我的(已经购买)课程列表
  @UseGuards(AuthGuard)
  @Get('my')
  findMy(@Req() req: Request) {
    return this.courseService.findMy(req.user.userId);
  }

}
