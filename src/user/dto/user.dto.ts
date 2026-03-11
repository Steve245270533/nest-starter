import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: '姓名', example: 'steve' })
  name: string;

  @ApiProperty({ description: '年龄', example: 27 })
  age: number;
}
