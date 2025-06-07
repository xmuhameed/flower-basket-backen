import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { HttpException } from '../exceptions/HttpException';
import { ParsedQs } from 'qs';
import { IsString, IsEmail, IsNumber, Min, Max, validate, ValidationError } from 'class-validator';

interface ValidationDTOs {
	body?: (new () => any)[];
	query?: (new () => any)[];
	params?: (new () => any)[];
}

export const validationMiddleware = (dtoClasses: ValidationDTOs) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			let errors: ValidationError[] = [];

			if (dtoClasses.body) {
				for (const dtoClass of dtoClasses.body) {
					const instance = plainToInstance(dtoClass, req.body);
					if (instance && Object.keys(instance).length > 0) {
						const validationErrors = await validate(instance, {
							forbidUnknownValues: false,
						});
						errors = [...errors, ...validationErrors];
						if (validationErrors.length === 0) {
							req.body = instance;
						}
					}
				}
			}

			if (dtoClasses.query) {
				for (const dtoClass of dtoClasses.query) {
					const instance = plainToInstance(dtoClass, req.query as Record<string, any>);
					console.log(instance);
					console.log(req.query);
					console.log(dtoClass);
					console.log(Object.keys(instance));
					console.log(instance && Object.keys(instance).length > 0);
					if (instance && Object.keys(instance).length > 0) {
						const validationErrors = await validate(instance, {
							forbidUnknownValues: false,
						});
						errors = [...errors, ...validationErrors];
						console.log(validationErrors);
						console.log(errors);
						if (validationErrors.length === 0) {
							req.query = instance as ParsedQs;
						}
					}
				}
			}

			if (dtoClasses.params) {
				for (const dtoClass of dtoClasses.params) {
					const instance = plainToInstance(dtoClass, req.params);
					if (instance && Object.keys(instance).length > 0) {
						const validationErrors = await validate(instance, {
							forbidUnknownValues: false,
						});
						errors = [...errors, ...validationErrors];
						if (validationErrors.length === 0) {
							req.params = instance;
						}
					}
				}
			}

			if (errors.length > 0) {
				const validationErrors = errors.map((error) => ({
					property: error.property,
					constraints: error.constraints,
				}));
				next(new HttpException(400, 'Validation failed', validationErrors));
			} else {
				next();
			}
		} catch (error) {
			console.log('error');
			console.error(error);
			next(error);
		}
	};
};

// Example DTOs
class CreateUserDto {
	@IsString()
	name: string;

	@IsEmail()
	email: string;
}

class PaginationDto {
	@IsNumber()
	@Min(1)
	page: number;

	@IsNumber()
	@Min(1)
	@Max(100)
	limit: number;
}
