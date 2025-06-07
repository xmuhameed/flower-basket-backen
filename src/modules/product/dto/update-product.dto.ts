import { IsString, IsInt, IsOptional, IsEnum, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { currency, Prisma } from '@prisma/client';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => value !== undefined ? parseInt(value) : undefined)
  @IsInt()
  price?: number;

  @IsOptional()
  @IsEnum(currency)
  currency?: currency;

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
  deleted_images?: string[];

  @IsOptional()
  @IsArray()
  product_images?: any[]; // New images
}
