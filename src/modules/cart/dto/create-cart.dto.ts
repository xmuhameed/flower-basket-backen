import { IsPositive, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCartDto {
	@Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((id: string) => parseInt(id)) : value))
	@IsNumber({}, { each: true })
	@IsPositive({ each: true })
	product_ids: number[];

	@Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((id: string) => parseInt(id)) : value))
	@IsNumber({}, { each: true })
	@IsPositive({ each: true })
	quantities: number[];
}
