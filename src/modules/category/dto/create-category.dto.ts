import { IsString, IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
	@IsString()
	name: string;

	@Transform(({ value }) => parseInt(value))
	@IsInt()
	sort: number;

	@IsOptional()
	@IsString()
	category_image?: string;
}
