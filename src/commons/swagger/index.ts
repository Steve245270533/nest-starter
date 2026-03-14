import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { ResponseDTO } from '@/commons/dto';

type ResponseDtoVariants = { single: Type<unknown>; array: Type<unknown> };

const responseDtoCache = new WeakMap<Type<unknown>, ResponseDtoVariants>();
const paginationResponseDtoCache = new WeakMap<
  Type<unknown>,
  { response: Type<unknown>; data: Type<unknown> }
>();

function getResponseDto<TModel extends Type<unknown>>(
  model: TModel,
  isArray: boolean,
) {
  const cached = responseDtoCache.get(model);
  if (cached) return isArray ? cached.array : cached.single;

  class ResponseOfModelDto extends ResponseDTO<InstanceType<TModel>> {
    @ApiProperty({ type: model })
    declare data: InstanceType<TModel>;
  }

  Object.defineProperty(ResponseOfModelDto, 'name', {
    value: `ResponseOf${model.name}`,
  });

  class ResponseOfModelArrayDto extends ResponseDTO<
    Array<InstanceType<TModel>>
  > {
    @ApiProperty({ type: model, isArray: true })
    declare data: Array<InstanceType<TModel>>;
  }

  Object.defineProperty(ResponseOfModelArrayDto, 'name', {
    value: `ResponseOf${model.name}Array`,
  });

  responseDtoCache.set(model, {
    single: ResponseOfModelDto,
    array: ResponseOfModelArrayDto,
  });

  return isArray ? ResponseOfModelArrayDto : ResponseOfModelDto;
}

/**
 * 响应成功，返回单个模型或数组模型
 */
export function ApiOkResponseData<TModel extends Type<unknown>>(
  model: TModel,
  options?: { isArray?: boolean },
) {
  const responseDto = getResponseDto(model, options?.isArray === true);
  return applyDecorators(
    ApiExtraModels(responseDto, model),
    ApiOkResponse({
      type: responseDto,
    }),
  );
}

/**
 * 响应成功，返回数组模型
 */
export function ApiOkResponseDataArray<TModel extends Type<unknown>>(
  model: TModel,
) {
  return ApiOkResponseData(model, { isArray: true });
}

function getPaginationResponseDto<TModel extends Type<unknown>>(model: TModel) {
  const cached = paginationResponseDtoCache.get(model);
  if (cached) return cached;

  class PaginationDataOfModelDto {
    @ApiProperty({ type: model, isArray: true })
    list: Array<InstanceType<TModel>>;

    @ApiProperty({ example: 0 })
    total: number;
  }

  Object.defineProperty(PaginationDataOfModelDto, 'name', {
    value: `PaginationDataOf${model.name}`,
  });

  class PaginationResponseOfModelDto extends ResponseDTO<PaginationDataOfModelDto> {
    @ApiProperty({ type: PaginationDataOfModelDto })
    declare data: PaginationDataOfModelDto;
  }

  Object.defineProperty(PaginationResponseOfModelDto, 'name', {
    value: `PaginationResponseOf${model.name}`,
  });

  const dtos = {
    response: PaginationResponseOfModelDto,
    data: PaginationDataOfModelDto,
  };
  paginationResponseDtoCache.set(model, dtos);
  return dtos;
}

/**
 * 响应成功，返回分页模型
 */
export function ApiOkResponsePaginationData<TModel extends Type<unknown>>(
  model: TModel,
) {
  const dtos = getPaginationResponseDto(model);
  return applyDecorators(
    ApiExtraModels(dtos.response, dtos.data, model),
    ApiOkResponse({
      type: dtos.response,
    }),
  );
}
