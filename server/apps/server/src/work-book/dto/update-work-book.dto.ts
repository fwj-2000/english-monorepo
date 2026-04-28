import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkBookDto } from './create-work-book.dto';

export class UpdateWorkBookDto extends PartialType(CreateWorkBookDto) {}
