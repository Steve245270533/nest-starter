import { z } from 'zod';

export const UserQuerySchema = z.strictObject({
  page: z.coerce
    .number<string>()
    .int()
    .min(1)
    .max(2_147_483_647)
    .default(1)
    .describe('页码，从 1 开始'),
  pageSize: z.coerce
    .number<string>()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe('每页记录数'),
});

export type UserQueryDto = z.output<typeof UserQuerySchema>;

export type UserQueryInput = z.input<typeof UserQuerySchema>;
