import { IsString, IsOptional } from 'class-validator';

export class CreateBrandDto {
	@IsString()
	name: string;


	@IsOptional()
	@IsString()
	brand_image?: string;
}
