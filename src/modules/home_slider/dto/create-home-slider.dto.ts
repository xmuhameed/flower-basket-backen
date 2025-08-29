import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateHomeSliderDto {
	@IsString()
	name: string;

	@IsString()
	name_ar: string;

	@Transform(({ value }) => parseInt(value))
	@IsInt()
	sort: number;

	@IsOptional()
	@IsString()
	slider_image?: string;

	@IsOptional()
	@IsString()
	button_text?: string;

	@IsOptional()
	@IsString()
	button_url?: string;
}
