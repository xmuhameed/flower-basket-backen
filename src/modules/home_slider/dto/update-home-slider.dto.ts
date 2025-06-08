import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateHomeSliderDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsInt()
	sort?: number;

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
