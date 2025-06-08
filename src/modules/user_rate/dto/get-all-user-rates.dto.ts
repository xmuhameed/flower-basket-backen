import { IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAllUserRatesDto {
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	user_id?: number;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	product_id?: number;
}
