import { IsOptional, IsInt, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ProductSortField {
	PRICE = 'price',
	NAME = 'name',
}

export enum SortOrder {
	ASC = 'asc',
	DESC = 'desc',
}

export class GetAllProductsDto {
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

	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	product_type_id?: number;

	@IsOptional()
	@IsEnum(ProductSortField)
	sort_by?: ProductSortField;

	@IsOptional()
	@IsEnum(SortOrder)
	order?: SortOrder;
}
