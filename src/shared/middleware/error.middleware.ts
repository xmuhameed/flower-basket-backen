import { Request, Response, NextFunction } from 'express';
// im port { HttpException } from '../exceptions/HttpException';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
	const status = err.status ?? 500;
	const message = err.message ?? 'Something went wrong';
	const errors = err.errors ?? [];

	res.status(status).json({
		success: false,
		message,
		errors,
	});
};
