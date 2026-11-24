import { z } from 'zod';
import { paginationSchema, responseSchema } from '../../commons/dto/index.js';
import { CreateUserSchema } from './create-user.dto.js';

export const UserIdSchema = z.coerce
  .number<string>()
  .int()
  .min(1)
  .max(2_147_483_647);

export const UserSchema = CreateUserSchema.extend({
  id: z.int32().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const UserResponseSchema = responseSchema(UserSchema);
export const UserPageResponseSchema = responseSchema(
  paginationSchema(UserSchema),
);

export type UserDto = z.output<typeof UserSchema>;

export type UserIdDto = z.output<typeof UserIdSchema>;
