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
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { Result } from "../commons/utils/result.js";
import { CreateUserSchema } from "./dto/create-user.dto.js";
import { UpdateUserSchema } from "./dto/update-user.dto.js";
import { UserQuerySchema } from "./dto/user-query.dto.js";
import {
  UserIdSchema,
  UserPageResponseSchema,
  UserResponseSchema,
} from "./dto/user.dto.js";
import { UserService } from "./user.service.js";

import type { CreateUserDto } from "./dto/create-user.dto.js";
import type { UpdateUserDto } from "./dto/update-user.dto.js";
import type { UserQueryDto } from "./dto/user-query.dto.js";
import type { UserIdDto } from "./dto/user.dto.js";

@ApiTags("用户")
@Controller("user")
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get("")
  @ApiOperation({ summary: "获取用户列表" })
  @ApiOkResponse({ standardSchema: UserPageResponseSchema })
  async findAll(@Query({ schema: UserQuerySchema }) query: UserQueryDto) {
    const { list, total } = await this.users.findAll(query);
    return Result.page(list, total);
  }

  @Post("create")
  @ApiOperation({ summary: "创建用户" })
  @ApiCreatedResponse({ standardSchema: UserResponseSchema })
  async create(@Body({ schema: CreateUserSchema }) body: CreateUserDto) {
    return Result.ok(
      await this.users.create(body),
      "success",
      HttpStatus.CREATED,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "获取用户详情" })
  @ApiOkResponse({ standardSchema: UserResponseSchema })
  async findOne(@Param("id", { schema: UserIdSchema }) id: UserIdDto) {
    return Result.ok(await this.users.findOne(id));
  }

  @Patch(":id")
  @ApiOperation({ summary: "更新用户" })
  @ApiOkResponse({ standardSchema: UserResponseSchema })
  async update(
    @Param("id", { schema: UserIdSchema }) id: UserIdDto,
    @Body({ schema: UpdateUserSchema }) body: UpdateUserDto,
  ) {
    return Result.ok(await this.users.update(id, body));
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除用户" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async remove(@Param("id", { schema: UserIdSchema }) id: UserIdDto) {
    await this.users.remove(id);
  }
}
