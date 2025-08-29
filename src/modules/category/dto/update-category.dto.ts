import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateCategoryDto {
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
	category_image?: string;
}
