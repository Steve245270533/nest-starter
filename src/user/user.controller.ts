import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationResponseDTO, ResponseDTO } from '@/commons/dto';
import {
  ApiOkResponseData,
  ApiOkResponsePaginationData,
} from '@/commons/swagger/api-ok-response-data';
import { ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  @Get('/all')
  @ApiOperation({ summary: '获取全部用户' })
  @ApiOkResponsePaginationData(UserDto)
  getUser(): PaginationResponseDTO<UserDto> {
    return {
      code: 200,
      msg: 'success',
      data: {
        list: [
          {
            name: 'steve',
            age: 27,
          },
          {
            name: 'omo',
            age: 22,
          },
        ],
        total: 2,
      },
    };
  }

  @Post('/create')
  @ApiOperation({ summary: '创建用户' })
  @ApiOkResponseData(UserDto)
  createUser(@Body() body: CreateUserDto): ResponseDTO<UserDto> {
    return {
      code: 200,
      msg: 'success',
      data: {
        name: body.name,
        age: body.age,
      },
    };
  }
}
