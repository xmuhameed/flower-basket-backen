import { IsString, IsOptional } from 'class-validator';

export class CreateBrandDto {
	@IsString()
	name: string;

	@IsString()
	name_ar: string;

	@IsOptional()
	@IsString()
	brand_image?: string;
}
