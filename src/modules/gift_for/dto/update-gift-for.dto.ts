import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateGiftForDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsInt()
	sort?: number;

	@IsOptional()
	@IsString()
	gift_for_image?: string;
}
