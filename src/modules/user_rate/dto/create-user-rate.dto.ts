import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserRateDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  user_id: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  product_id: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  rate: number;

  @IsOptional()
  @IsString()
  rate_text?: string;
}
