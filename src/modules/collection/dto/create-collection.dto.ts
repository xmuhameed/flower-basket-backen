import { IsString, IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCollectionDto {
	@IsString()
	name: string;

	@IsString()
	name_ar: string;

	@Transform(({ value }) => parseInt(value))
	@IsInt()
	sort: number;

	@IsOptional()
	@IsString()
	collection_image?: string;
}
