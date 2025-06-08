import { IsOptional, IsInt, IsString } from 'class-validator';

export class GetAllCategoriesDto {
	@IsOptional()
	@IsInt()
	id?: number;

	@IsOptional()
	@IsString()
	name?: string;
}
