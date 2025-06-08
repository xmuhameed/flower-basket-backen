import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { checkPagination, GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// con st dto = req.query as GetAllAdminsDto;
		const pagination = req.query as GlobalPaginationDto;
		const search = req.query as GlobalSearchDto;
		const whereObj: Prisma.userWhereInput = {
			deleted: false,
		};
		if (search.search) {
			whereObj.OR = [
				{
					fullname: {
						contains: search.search,
					},
				},
				{
					email: {
						contains: search.search,
					},
				},
			];
		}
		const users = await prisma.user.findMany({
			where: whereObj,
			select: {
				id: true,
				fullname: true,
				email: true,
				phone: true,
				gender: true,
				birth_date: true,
				profile_image_url: true,
			},
			...checkPagination(pagination),
		});
		const totalUsers = await prisma.user.count({
			where: whereObj,
		});
		res.status(200).json({
			success: true,
			count: totalUsers,
			data: users,
		});
	} catch (err) {
		next(err);
	}
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.params as any as IdentifierDto;
		const user = await prisma.user.findUnique({
			where: {
				id: dto.id,
				deleted: false,
			},
		});

		if (!user) {
			return next(new Error('User not found'));
		}

		await prisma.user.update({
			where: {
				id: user.id,
				deleted: false,
			},
			data: {
				deleted: true,
			},
		});
		res.status(200).json({ success: true, message: 'User deleted successfully' });
	} catch (err) {
		next(err);
	}
};
