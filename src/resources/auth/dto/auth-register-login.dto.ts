import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, NotContains } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthRegisterLoginDto {
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsEmail()
  @NotContains(' ')
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @NotContains(' ')
  @IsNotEmpty()
  password: string;
}
