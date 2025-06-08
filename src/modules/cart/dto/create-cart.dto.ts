import { IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCartDto {
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	product_id: number;

	@Transform(({ value }) => parseInt(value))
	@IsInt()
	quantity: number;
}
