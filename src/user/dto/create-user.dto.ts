import { z } from 'zod';

export const CreateUserSchema = z.strictObject({
  name: z.string().trim().min(1).max(100).describe('姓名'),
  age: z.int32().min(1).describe('年龄'),
});

export type CreateUserDto = z.output<typeof CreateUserSchema>;
