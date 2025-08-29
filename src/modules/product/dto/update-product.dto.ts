import { IsString, IsInt, IsOptional, IsEnum, IsArray, IsPositive, IsNumber, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { currency, Prisma } from '@prisma/client';

export class UpdateProductDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	name_ar?: string;

	@IsOptional()
	@Transform(({ value }) => (value !== undefined ? parseInt(value) : undefined))
	@IsInt()
	price?: number;

	@IsOptional()
	@IsEnum(currency)
	currency?: currency;

	// @Transform(({ value }) => parseInt(value))
	// @IsOptional()
	// @IsInt()
	// category_id?: number;

	// @Transform(({ value }) => parseInt(value))
	// @IsOptional()
	// @IsInt()
	// gift_for_id?: number;

	@IsOptional()
	@Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((id: string) => parseInt(id)) : value))
	@IsNumber({}, { each: true })
	@IsPositive({ each: true })
	category_ids?: number[];

	@IsOptional()
	@Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((id: string) => parseInt(id)) : value))
	@IsNumber({}, { each: true })
	@IsPositive({ each: true })
	gift_for_ids?: number[];

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	collection_id?: number;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	collection_index?: number;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	brand_id?: number;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	product_type_id?: number;

	@IsOptional()
	@IsArray()
	deleted_images?: string[];

	@IsOptional()
	@IsArray()
	product_images?: any[]; // New images

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	how_to_care?: string;

	@IsOptional()
	@IsString()
	content?: string;

	@IsOptional()
	@IsString()
	alert?: string;

	@IsOptional()
	@IsString()
	dimensions?: string;

	@IsOptional()
	@IsBoolean()
	fast_delivery?: boolean;

	@IsOptional()
	@IsString()
	color?: string;
}
