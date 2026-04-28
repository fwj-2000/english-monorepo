import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkBookService } from './work-book.service';
import { CreateWorkBookDto } from './dto/create-work-book.dto';
import { UpdateWorkBookDto } from './dto/update-work-book.dto';

@Controller('work-book')
export class WorkBookController {
  constructor(private readonly workBookService: WorkBookService) {}

  @Post()
  create(@Body() createWorkBookDto: CreateWorkBookDto) {
    return this.workBookService.create(createWorkBookDto);
  }

  @Get()
  findAll() {
    return this.workBookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workBookService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkBookDto: UpdateWorkBookDto) {
    return this.workBookService.update(+id, updateWorkBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workBookService.remove(+id);
  }
}
