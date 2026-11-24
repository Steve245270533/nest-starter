import { z } from 'zod';

export const CreateUserSchema = z
  .strictObject({
    name: z
      .string({
        error: (issue) =>
          issue.input === undefined || issue.input === null
            ? '姓名不能为空'
            : '姓名必须是字符串',
      })
      .trim()
      .min(1, { error: '姓名不能为空' })
      .max(100, { error: '姓名不能超过100个字符' })
      .describe('姓名'),
    age: z
      .int32({
        error: (issue) =>
          issue.input === undefined || issue.input === null
            ? '年龄不能为空'
            : '年龄必须是整数',
      })
      .min(1, { error: '年龄不能小于1' })
      .describe('年龄'),
  })
  .meta({ title: 'CreateUserRequest' });

export type CreateUserDto = z.output<typeof CreateUserSchema>;
