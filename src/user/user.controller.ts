import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Result } from '../commons/utils/result.js';
import { CreateUserSchema, type CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserSchema, type UpdateUserDto } from './dto/update-user.dto.js';
import { UserQuerySchema, type UserQueryDto } from './dto/user-query.dto.js';
import {
  UserIdSchema,
  type UserIdDto,
  UserPageResponseSchema,
  UserResponseSchema,
} from './dto/user.dto.js';
import { UserService } from './user.service.js';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get('all')
  @ApiOkResponse({ standardSchema: UserPageResponseSchema })
  async findAll(@Query({ schema: UserQuerySchema }) query: UserQueryDto) {
    const { list, total } = await this.users.findAll(query);
    return Result.page(list, total);
  }

  @Post('create')
  @ApiCreatedResponse({ standardSchema: UserResponseSchema })
  async create(@Body({ schema: CreateUserSchema }) body: CreateUserDto) {
    return Result.ok(
      await this.users.create(body),
      'success',
      HttpStatus.CREATED,
    );
  }

  @Get(':id')
  @ApiOkResponse({ standardSchema: UserResponseSchema })
  async findOne(@Param('id', { schema: UserIdSchema }) id: UserIdDto) {
    return Result.ok(await this.users.findOne(id));
  }

  @Patch(':id')
  @ApiOkResponse({ standardSchema: UserResponseSchema })
  async update(
    @Param('id', { schema: UserIdSchema }) id: UserIdDto,
    @Body({ schema: UpdateUserSchema }) body: UpdateUserDto,
  ) {
    return Result.ok(await this.users.update(id, body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async remove(@Param('id', { schema: UserIdSchema }) id: UserIdDto) {
    await this.users.remove(id);
  }
}
