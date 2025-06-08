import { IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAllCartsDto {
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	product_id?: number;
}
