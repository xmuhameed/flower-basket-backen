import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateProductTypeDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	name_ar?: string;

	@IsOptional()
	@IsInt()
	sort?: number;

	@IsOptional()
	@IsString()
	product_type_image?: string;
}
