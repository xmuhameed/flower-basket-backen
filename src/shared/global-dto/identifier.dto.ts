import { Transform } from 'class-transformer';
import {
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
} from 'class-validator';

export class IdentifierDto {
	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	@IsPositive()
	id: number;
}

export class QrCodeIdentifierDto {
	@IsString()
	@IsNotEmpty()
	qrcode: string;
}

export class IdentifiersDto {
	@Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((id: string) => parseInt(id)) : value))
	@IsNumber({}, { each: true })
	@IsPositive({ each: true })
	ids: number[];
}

export class IDorQRCodeIdentifierDto {
	@IsString()
	@IsOptional()
	qrcode?: string;

	@Transform(({ value }) => parseInt(value))
	@IsNumber()
	@IsPositive()
	@IsOptional()
	id?: number;

	@IsOneFieldPresent(['qrcode', 'id'], {
		message: 'Either qrcode or id must be provided.',
	})
	dummyProperty?: any; // This property is only for applying the custom validator
}

export function IsOneFieldPresent(fields: string[], validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: 'isOneFieldPresent',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: fields,
			validator: {
				validate(_: any, args: ValidationArguments) {
					const object = args.object as any;
					const fields = args.constraints as string[];
					return fields.some(
						(field) => object[field] !== undefined && object[field] !== null && object[field] !== '',
					);
				},
				defaultMessage(args: ValidationArguments) {
					const fields = args.constraints.join(' or ');
					return `At least one of ${fields} must be provided.`;
				},
			},
		});
	};
}
