import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateHomeSliderDto {
	@IsString()
	name: string;

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
