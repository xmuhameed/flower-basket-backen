import { IsString, IsInt, IsOptional, IsEnum, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { currency, Prisma } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  name: string;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  price: number;

  @IsEnum(currency)
  currency: currency;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsInt()
  category_id?: number;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsInt()
  collection_id?: number;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsInt()
  gift_for_id?: number;

  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @IsInt()
  brand_id?: number;

  @IsOptional()
  @IsArray()
  product_images?: any[]; // Will be handled by file upload
}
