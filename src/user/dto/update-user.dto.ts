import { z } from 'zod';
import { CreateUserSchema } from './create-user.dto.js';

export const UpdateUserSchema = CreateUserSchema.partial()
  .refine(({ name, age }) => name !== undefined || age !== undefined, {
    message: '至少提供一个要更新的字段',
  })
  .meta({ title: 'UpdateUserRequest', minProperties: 1 });

export type UpdateUserDto = z.output<typeof UpdateUserSchema>;
