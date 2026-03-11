import { Controller, Get } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { PaginationResponseDTO } from '@/commons/dto';
import { ApiOkResponsePaginationData } from '@/commons/swagger/api-ok-response-data';
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
}
