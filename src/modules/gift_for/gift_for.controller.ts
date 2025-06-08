import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid/async';
import { CreateGiftForDto } from './dto/create-gift-for.dto';
import { UpdateGiftForDto } from './dto/update-gift-for.dto';
import { GetAllGiftForDto } from './dto/get-all-gift-for.dto';
import { checkPagination, GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { deleteFile, saveFile } from '../../shared/middleware/save-file.middleware';

const prisma = new PrismaClient();

export const createGiftFor = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateGiftForDto;
		const uniqueGiftForCode = await nanoid(10);
		const giftForData: Prisma.gift_forCreateInput = {
			name: dto.name,
			sort: dto.sort,
			qrcode: uniqueGiftForCode,
		};
		const nestedFolder = `gift_for/gift_for-${uniqueGiftForCode}`;
		if (req.files?.['gift_for_image']) {
			const result = await saveFile(nestedFolder, req.files['gift_for_image'] as any, {
				prefix: 'gift_for-',
				allowedExtensions: ['.jpg', '.png', '.jpeg'],
			});
			giftForData.gift_for_image_url = result.relativePath;
		}
		const giftFor = await prisma.gift_for.create({ data: giftForData });
		res.status(201).json({ success: true, data: giftFor });
	} catch (err) {
		next(err);
	}
};

export const getAllGiftFor = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.query as GetAllGiftForDto;
		const pagination = req.query as GlobalPaginationDto;
		const search = req.query as GlobalSearchDto;
		const whereObj: Prisma.gift_forWhereInput = {
			deleted: false,
		};
		if (search.search) {
			whereObj.OR = [{ name: { contains: search.search } }];
		}
		const giftFors = await prisma.gift_for.findMany({
			where: whereObj,
			orderBy: { sort: 'asc' },
			...checkPagination(pagination),
		});
		const totalGiftFors = await prisma.gift_for.count({ where: whereObj });
		res.status(200).json({ success: true, count: totalGiftFors, data: giftFors });
	} catch (err) {
		next(err);
	}
};

export const getGiftForById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.params as any as IdentifierDto;
		const giftFor = await prisma.gift_for.findUnique({
			where: { id: dto.id, deleted: false },
			select: {
				id: true,
				qrcode: true,
				name: true,
				sort: true,
				gift_for_image_url: true,
				createdAt: true,
				updatedAt: true,
				product: {
					select: {
						id: true,
						name: true,
						price: true,
						currency: true,
						description: true,
						how_to_care: true,
						content: true,
						alert: true,
						dimensions: true,
						category: { select: { id: true, name: true } },
						collection: { select: { id: true, name: true } },
						gift_for: { select: { id: true, name: true } },
						brand: { select: { id: true, name: true } },
						product_image: true,
						createdAt: true,
						updatedAt: true,
					}
				}
			}
		});
		if (!giftFor) {
			return next(new Error('GiftFor not found'));
		}
		res.status(200).json({ success: true, data: giftFor });
	} catch (err) {
		next(err);
	}
};

export const updateGiftFor = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as UpdateGiftForDto;
		const identifier = req.params as any as IdentifierDto;
		const giftFor = await prisma.gift_for.findUnique({
			where: { id: identifier.id, deleted: false },
		});
		if (!giftFor) {
			return next(new Error('GiftFor not found'));
		}
		const giftForData: Prisma.gift_forUpdateInput = {
			...(dto.name && { name: dto.name }),
			...(dto.sort && { sort: dto.sort }),
		};
		const nestedFolder = `gift_for/gift_for-${giftFor.qrcode}`;
		if (req.files?.['gift_for_image']) {
			if (giftFor.gift_for_image_url) {
				await deleteFile(giftFor.gift_for_image_url);
			}
			const result = await saveFile(nestedFolder, req.files['gift_for_image'] as any, {
				prefix: 'gift_for-',
				allowedExtensions: ['.jpg', '.png', '.jpeg'],
			});
			giftForData.gift_for_image_url = result.relativePath;
		}
		const updatedGiftFor = await prisma.gift_for.update({
			where: { id: identifier.id },
			data: giftForData,
		});
		res.status(200).json({ success: true, data: updatedGiftFor });
	} catch (err) {
		next(err);
	}
};

export const deleteGiftFor = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const identifier = req.params as any as IdentifierDto;
		const giftFor = await prisma.gift_for.findUnique({
			where: { id: identifier.id, deleted: false },
		});
		if (!giftFor) {
			return next(new Error('GiftFor not found'));
		}
		await prisma.gift_for.update({
			where: { id: identifier.id },
			data: { deleted: true },
		});
		res.status(200).json({ success: true, message: 'GiftFor deleted successfully' });
	} catch (err) {
		next(err);
	}
};
