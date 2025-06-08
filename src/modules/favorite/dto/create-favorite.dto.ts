import { IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFavoriteDto {
	// @Transform(({ value }) => parseInt(value))
	// @IsInt()
	// user_id: number;

	@Transform(({ value }) => parseInt(value))
	@IsInt()
	product_id: number;
}
