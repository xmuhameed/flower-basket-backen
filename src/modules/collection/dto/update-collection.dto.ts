import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateCollectionDto {
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
	collection_image?: string;
}
