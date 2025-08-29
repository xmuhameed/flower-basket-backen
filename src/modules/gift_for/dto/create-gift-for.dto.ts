import { IsString, IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateGiftForDto {
	@IsString()
	name: string;

	@IsString()
	name_ar: string;

	@Transform(({ value }) => parseInt(value))
	@IsInt()
	sort: number;

	@IsOptional()
	@IsString()
	gift_for_image?: string;
}
