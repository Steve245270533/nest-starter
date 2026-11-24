import type { PaginationResponseDTO, ResponseDTO } from '../dto/index.js';

export class Result {
  static ok<T>(data: T, msg = 'success', code = 200): ResponseDTO<T> {
    return { code, msg, data };
  }

  static fail(code: number, msg: string): ResponseDTO<null> {
    return { code, msg, data: null };
  }

  static page<T>(list: T[], total: number): PaginationResponseDTO<T> {
    return this.ok({ list, total });
  }
}
