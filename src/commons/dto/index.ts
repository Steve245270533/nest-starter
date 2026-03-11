import { ApiProperty } from '@nestjs/swagger';

/**
 * 普通响应体DTO
 */
export class ResponseDTO<T> {
  @ApiProperty({ description: '状态码', example: 200 })
  code: number;
  @ApiProperty({ description: '信息', example: 'success' })
  msg: string;
  @ApiProperty({ description: '数据' })
  data: T;
}

export class PaginationDataDTO<T> {
  @ApiProperty({ description: '列表', isArray: true })
  list: T[];
  @ApiProperty({ description: '总数', example: 0 })
  total: number;
}

/**
 * 分页响应体DTO
 */
export class PaginationResponseDTO<T> extends ResponseDTO<
  PaginationDataDTO<T>
> {
  @ApiProperty({ description: '数据', type: () => PaginationDataDTO })
  declare data: PaginationDataDTO<T>;
}
