import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// 1. 定义 Zod 校验 Schema
const CreateUserSchema = z.object({
  name: z
    .string('姓名必须是字符串！')
    .nonempty('姓名不能为空！')
    .describe('姓名')
    .min(1, { message: '姓名不能为空！' }),
  age: z
    .number('年龄必须是数字！')
    .describe('年龄')
    .min(1, { message: '年龄最小为1！' }),
});

// 2. 导出被 NestJS 识别的 DTO Class (内置了类型和 Swagger 元数据)
export class CreateUserDto extends createZodDto(CreateUserSchema) {}

// (可选) 如果需要纯 TS 类型在其他地方使用，可以直接推断出来：
// export type CreateUserType = z.infer<typeof CreateUserSchema>;
