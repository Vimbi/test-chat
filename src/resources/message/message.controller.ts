import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessageService } from './message.service';

@ApiTags('Messages')
@Controller({
  path: 'messages',
  version: '1',
})
export default class MessageController {
  constructor(private readonly repository: MessageService) {}

  @Get()
  async getAll() {
    return this.repository.findAll();
  }
}
