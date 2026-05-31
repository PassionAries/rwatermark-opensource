import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min, Max, IsString, IsIn, IsNotEmpty,  MinLength } from 'class-validator';

export class UserLoginDto {
  @IsString({ message: '账号必须是字符串' })
  @IsNotEmpty({ message: '账号不能为空' })
  @Transform(({ value }) => value?.trim())
  account: string;

  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;

  ip: string;
  userAgent: string;
}