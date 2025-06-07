import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { CreateAdminDto, UpdateAdminDto } from './dto';
import { deleteFile, saveFile } from '../../shared/middleware/save-file.middleware';
import { nanoid } from 'nanoid/async';
import { checkPagination, GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { hashPassword } from '../auth/auth.service';

const prisma = new PrismaClient();

export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateAdminDto;

		const uniqueAdminCode = await nanoid(10);
		const hashedPassword = await hashPassword(dto.password);
		const adminData: Prisma.adminCreateInput = {
			fullname: dto.fullname,
			email: dto.email,
			phone: dto.phone,
			birth_date: dto.birth_date ? new Date(dto.birth_date) : undefined,
			gender: dto.gender,
			password: hashedPassword,
			qrcode: uniqueAdminCode,
		};

		const nestedFolder = `admins/admin-${uniqueAdminCode}`;

		if (req.files?.['profile_image']) {
			const result = await saveFile(nestedFolder, req.files['profile_image'] as any, {
				prefix: 'profile-',
				allowedExtensions: ['.jpg', '.png', '.jpeg'],
			});
			adminData.profile_image_url = result.relativePath;
		}

		const admin = await prisma.admin.create({
			data: adminData,
			// select: {
			// 	id: true,
			// 	first_name: true,
			// 	second_name: true,
			// }
		});
		res.status(201).json({ success: true, data: admin });
	} catch (err) {
		next(err);
	}
};

export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// con st dto = req.query as GetAllAdminsDto;
		const pagination = req.query as GlobalPaginationDto;
		const search = req.query as GlobalSearchDto;
		const whereObj: Prisma.adminWhereInput = {
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
		const admins = await prisma.admin.findMany({
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
		const totalAdmins = await prisma.admin.count({
			where: whereObj,
		});
		res.status(200).json({
			success: true,
			count: totalAdmins,
			data: admins,
		});
	} catch (err) {
		next(err);
	}
};

export const getAdminById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.params as any as IdentifierDto;
		const admin = await prisma.admin.findUnique({
			where: {
				id: dto.id,
				deleted: false,
			},
			select: {
				id: true,
				fullname: true,
				gender: true,
				birth_date: true,
				email: true,
				phone: true,
				qrcode: true,
				profile_image_url: true,
			},
		});

		if (!admin) {
			return next(new Error('Admin not found'));
		}
		res.status(200).json({ success: true, data: admin });
	} catch (err) {
		next(err);
	}
};

export const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as UpdateAdminDto;
		const identifier = req.params as any as IdentifierDto;

		const admin = await prisma.admin.findUnique({
			where: {
				id: identifier.id,
				deleted: false,
			},
		});

		if (!admin) {
			return next(new Error('Admin not found'));
		}

		const adminData: Prisma.adminUpdateInput = {
			...(dto.fullname && { fullname: dto.fullname }),
			...(dto.gender && { gender: dto.gender }),
			...(dto.birth_date && { birth_date: new Date(dto.birth_date) }),
			...(dto.email && { email: dto.email }),
			...(dto.phone && { phone: dto.phone }),
		};

		if (dto.password) {
			const hashedPassword = await hashPassword(dto.password);
			adminData.password = hashedPassword;
		}

		const nestedFolder = `admins/admin-${admin.qrcode}`;

		if (req.files?.['profile_image']) {
			const result = await saveFile(nestedFolder, req.files['profile_image'] as any, {
				prefix: 'profile-',
				allowedExtensions: ['.jpg', '.png', '.jpeg'],
			});
			adminData.profile_image_url = result.relativePath;
		}

		const updatedAdmin = await prisma.admin.update({
			where: {
				id: identifier.id,
				deleted: false,
			},
			data: adminData,
		});

		if (req.files?.['profile_image']) {
			await deleteFile(admin.profile_image_url);
		}

		res.status(200).json({ success: true, data: updatedAdmin });
	} catch (err) {
		next(err);
	}
};

export const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.params as any as IdentifierDto;
		const admin = await prisma.admin.findUnique({
			where: {
				id: dto.id,
				deleted: false,
			},
		});

		if (!admin) {
			return next(new Error('Admin not found'));
		}

		await prisma.admin.update({
			where: {
				id: admin.id,
				deleted: false,
			},
			data: {
				deleted: true,
			},
		});
		res.status(200).json({ success: true, message: 'Admin deleted successfully' });
	} catch (err) {
		next(err);
	}
};
