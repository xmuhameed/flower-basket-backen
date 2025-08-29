import { IsString, IsOptional } from 'class-validator';

export class UpdateBrandDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	name_ar?: string;

	@IsOptional()
	@IsString()
	brand_image?: string;
}
