import { IsOptional, IsString } from 'class-validator';

export class GlobalSearchDto {
	@IsString()
	@IsOptional()
	search?: string;
}
