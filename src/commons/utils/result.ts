import { PaginationResponseDTO, ResponseDTO } from '@/commons/dto';

export class Result {
  static ok<T>(data: T, msg = 'success'): ResponseDTO<T> {
    return {
      code: 200,
      msg,
      data,
    };
  }

  static fail(code: number, msg: string, data: any = null): ResponseDTO<any> {
    return {
      code,
      msg,
      data,
    };
  }

  static page<T>(list: T[], total: number): PaginationResponseDTO<T> {
    return {
      code: 200,
      msg: 'success',
      data: {
        list,
        total,
      },
    };
  }
}
