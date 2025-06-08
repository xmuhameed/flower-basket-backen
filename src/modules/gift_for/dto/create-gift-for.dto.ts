import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateGiftForDto {
	@IsString()
	name: string;

	@IsInt()
	sort: number;

	@IsOptional()
	@IsString()
	gift_for_image?: string;
}
