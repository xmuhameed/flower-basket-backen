import { IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserRateDto {
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	rate?: number;

	@IsOptional()
	@IsString()
	rate_text?: string;
}
