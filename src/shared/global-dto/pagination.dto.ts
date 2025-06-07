import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, IsPositive } from 'class-validator';

export class GlobalPaginationDto {
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	@IsPositive()
	page?: number;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	@IsPositive()
	pageItemsCount?: number;
}

export function checkPagination(pagination: GlobalPaginationDto) {
	if (!pagination?.page || !pagination?.pageItemsCount) {
		return null;
	}

	return {
		take: pagination.pageItemsCount,
		skip: (pagination.page - 1) * pagination.pageItemsCount,
	};
}
