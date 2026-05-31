import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, MaxLength, Min, MinLength } from "class-validator";

export class SpLoginDto {
  @ApiProperty({ description: '小程序 appid', required: false })
  @IsOptional()
  @IsString()
  appid?: string;

  @ApiProperty({ description: '微信登录 code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '邀请码（邀请人的 inviteCode），新用户首次登录时写入邀请记录', required: false })
  @IsOptional()
  @IsString()
  inviteCode?: string;
}

/** 积分明细列表查询 */
export class FindPointsDetailListDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}