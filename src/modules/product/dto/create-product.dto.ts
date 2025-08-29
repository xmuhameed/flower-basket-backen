import { IsString, IsInt, IsOptional, IsEnum, IsArray, IsNumber, IsPositive, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { currency, Prisma } from '@prisma/client';

export class CreateProductDto {
	@IsString()
	name: string;

	@IsString()
	name_ar: string;

	@Transform(({ value }) => parseInt(value))
	@IsInt()
	price: number;

	@IsEnum(currency)
	currency: currency;

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

	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	collection_id?: number;

	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	collection_index?: number;

	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	brand_id?: number;
	
	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	product_type_id?: number;

	@IsOptional()
	@IsArray()
	product_images?: any[];

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
