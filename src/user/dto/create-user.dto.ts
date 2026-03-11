import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: '姓名',
    example: 'steve_01',
  })
  @IsString()
  @IsNotEmpty({ message: '姓名不能为空！' })
  name: string;

  @ApiProperty({ description: '年龄', example: 27 })
  @IsNotEmpty({ message: '年龄不能为空！' })
  @IsInt({ message: '年龄必须为整数！' })
  @Min(1, { message: '年龄最小为1！' })
  age: number;
}
