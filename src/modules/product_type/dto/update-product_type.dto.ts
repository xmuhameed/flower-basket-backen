import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateProductTypeDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsInt()
	sort?: number;

	@IsOptional()
	@IsString()
	product_type_image?: string;
}
