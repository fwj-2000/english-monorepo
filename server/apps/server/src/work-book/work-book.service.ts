import { Injectable } from '@nestjs/common';
import { CreateWorkBookDto } from './dto/create-work-book.dto';
import { UpdateWorkBookDto } from './dto/update-work-book.dto';

@Injectable()
export class WorkBookService {
  create(createWorkBookDto: CreateWorkBookDto) {
    return 'This action adds a new workBook';
  }

  findAll() {
    return `This action returns all workBook`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workBook`;
  }

  update(id: number, updateWorkBookDto: UpdateWorkBookDto) {
    return `This action updates a #${id} workBook`;
  }

  remove(id: number) {
    return `This action removes a #${id} workBook`;
  }
}
