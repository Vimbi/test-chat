import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export default class UserController {
  constructor(private readonly repository: UserService) {}

  @Get()
  async getAll() {
    return this.repository.findAll();
  }

  @Get(':email')
  public async findByEmail(@Param('email') email: string) {
    return await this.repository.findNoPass({ email });
  }
}
