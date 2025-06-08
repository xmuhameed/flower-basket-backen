import { IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	cart_user_id?: number;

	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@IsOptional()
	product_id?: number;

	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	quantity?: number;

	@Transform(({ value }) => parseInt(value))
	@IsInt()
	address_id: number;
}
