import { Injectable } from '@nestjs/common';
import { chatMode } from './prompt.mode';
import { ResponseService } from '@libs/shared';
@Injectable()
export class PromptService {
  constructor(private readonly responseService: ResponseService) { }
  findAll() {
    const res = chatMode.map(item => ({
      label: item.label,
      id: item.id,
      role: item.role
    }))
    return this.responseService.success(res)
  }
}
