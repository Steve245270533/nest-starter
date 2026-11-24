import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type User } from '../../prisma/generated/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { UserQueryDto } from './dto/user-query.dto.js';
import type { UserDto } from './dto/user.dto.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<UserDto> {
    return this.toDto(await this.prisma.user.create({ data }));
  }

  async findAll({ page, pageSize }: UserQueryDto) {
    const [users, total] = await this.prisma.$transaction(
      [
        this.prisma.user.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { id: 'asc' },
        }),
        this.prisma.user.count(),
      ],
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );

    return { list: users.map((user) => this.toDto(user)), total };
  }

  async findOne(id: number): Promise<UserDto> {
    return this.toDto(
      await this.findExisting(
        this.prisma.user.findUniqueOrThrow({ where: { id } }),
      ),
    );
  }

  async update(id: number, data: UpdateUserDto): Promise<UserDto> {
    return this.toDto(
      await this.findExisting(this.prisma.user.update({ where: { id }, data })),
    );
  }

  async remove(id: number): Promise<void> {
    await this.findExisting(this.prisma.user.delete({ where: { id } }));
  }

  private async findExisting(operation: Promise<User>): Promise<User> {
    try {
      return await operation;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('用户不存在');
      }
      throw error;
    }
  }

  private toDto({ id, name, age, createdAt, updatedAt }: User): UserDto {
    return {
      id,
      name,
      age,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
