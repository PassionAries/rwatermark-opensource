import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min, Max, IsString, IsIn } from 'class-validator';

export class FindManyDto {
  @IsNumber({}, { message: '页码必须是数字' })
  @IsOptional()
  @Min(1, { message: '页码不能小于1' })
  page?: number = 1;

  @IsNumber({}, { message: '每页数量必须是数字' })
  @IsOptional()
  @Min(1, { message: '每页数量不能小于1' })
  @Max(3000, { message: '每页数量不能超过3000' })
  limit?: number = 10;

  @IsString({ message: '排序字段必须是字符串' })
  @IsOptional()
  sortBy?: string = 'id';

  @IsString({ message: '排序方向必须是字符串' })
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  @IsIn(['asc', 'desc'], { message: '排序方向必须是asc或desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsString({ message: '搜索字段必须是字符串' })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  keywords?: string;

  @IsNumber({}, { message: '是否返回总数必须是数字' })
  @IsOptional()
  withCount?: number = 0;
}