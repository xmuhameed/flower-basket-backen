import { IsInt, IsOptional } from 'class-validator';

export class GetAllAddressesDto {
	@IsOptional()
	@IsInt()
	user_id?: number;
}
