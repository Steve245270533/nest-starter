import { z } from "zod";

export function responseSchema<T extends z.ZodType>(data: T) {
  return z.object({
    code: z.number().int().describe("状态码"),
    msg: z.string().describe("消息"),
    data,
  });
}

export function paginationSchema<T extends z.ZodType>(item: T) {
  return z.object({
    list: z.array(item),
    total: z.number().int().nonnegative(),
  });
}

export type ResponseSchema<T extends z.ZodType> = ReturnType<
  typeof responseSchema<T>
>;
export type PaginationSchema<T extends z.ZodType> = ReturnType<
  typeof paginationSchema<T>
>;

export type ResponseDTO<T> = z.output<ResponseSchema<z.ZodType<T>>>;
export type PaginationResponseDTO<T> = z.output<
  ResponseSchema<PaginationSchema<z.ZodType<T>>>
>;
