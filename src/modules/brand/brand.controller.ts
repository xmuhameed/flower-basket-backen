import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid/async';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { GetAllBrandsDto } from './dto/get-all-brands.dto';
import { checkPagination, GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { deleteFile, saveFile } from '../../shared/middleware/save-file.middleware';

const prisma = new PrismaClient();

export const createBrand = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateBrandDto;
		const uniqueBrandCode = await nanoid(10);
		const brandData: Prisma.brandCreateInput = {
			name: dto.name,
			name_ar: dto.name_ar,
			qrcode: uniqueBrandCode,
		};
		const nestedFolder = `brands/brand-${uniqueBrandCode}`;
		if (req.files?.['brand_image']) {
			const result = await saveFile(nestedFolder, req.files['brand_image'] as any, {
				prefix: 'brand-',
				allowedExtensions: ['.jpg', '.png', '.jpeg'],
			});
			brandData.brand_image_url = result.relativePath;
		}
		const brand = await prisma.brand.create({ data: brandData });
		res.status(201).json({ success: true, data: brand });
	} catch (err) {
		next(err);
	}
};

export const getAllBrands = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.query as GetAllBrandsDto;
		const pagination = req.query as GlobalPaginationDto;
		const search = req.query as GlobalSearchDto;
		const whereObj: Prisma.brandWhereInput = {
			deleted: false,
		};
		if (search.search) {
			whereObj.OR = [{ name: { contains: search.search } }, { name_ar: { contains: search.search } }];
		}
		const brands = await prisma.brand.findMany({
			where: whereObj,
			orderBy: { name: 'asc' },
			...checkPagination(pagination),
		});
		const totalBrands = await prisma.brand.count({ where: whereObj });
		res.status(200).json({ success: true, count: totalBrands, data: brands });
	} catch (err) {
		next(err);
	}
};

export const getBrandById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.params as any as IdentifierDto;
		const brand = await prisma.brand.findUnique({
			where: { id: dto.id, deleted: false },
			select: {
				id: true,
				qrcode: true,
				name: true,
				name_ar: true,
				brand_image_url: true,
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
						// categor: { select: { id: true, name: true } },
						// gift_for: { select: { id: true, name: true } },
						product_category_relation: { select: { id: true, category: { select: { id: true, name: true, name_ar: true } } } },
						product_gift_for_relation: { select: { id: true, gift_for: { select: { id: true, name: true, name_ar: true } } } },
						collection: { select: { id: true, name: true, name_ar: true } },
						brand: { select: { id: true, name: true, name_ar: true } },
						product_image: true,
						createdAt: true,
						updatedAt: true,
					},
				},
			},
		});
		if (!brand) {
			return next(new Error('Brand not found'));
		}
		res.status(200).json({ success: true, data: brand });
	} catch (err) {
		next(err);
	}
};

export const updateBrand = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as UpdateBrandDto;
		const identifier = req.params as any as IdentifierDto;
		const brand = await prisma.brand.findUnique({
			where: { id: identifier.id, deleted: false },
		});
		if (!brand) {
			return next(new Error('Brand not found'));
		}
		const brandData: Prisma.brandUpdateInput = {
			...(dto.name && { name: dto.name }),
			...(dto.name_ar && { name_ar: dto.name_ar }),
		};
		const nestedFolder = `brands/brand-${brand.qrcode}`;
		if (req.files?.['brand_image']) {
			if (brand.brand_image_url) {
				await deleteFile(brand.brand_image_url);
			}
			const result = await saveFile(nestedFolder, req.files['brand_image'] as any, {
				prefix: 'brand-',
				allowedExtensions: ['.jpg', '.png', '.jpeg'],
			});
			brandData.brand_image_url = result.relativePath;
		}
		const updatedBrand = await prisma.brand.update({
			where: { id: identifier.id },
			data: brandData,
		});
		res.status(200).json({ success: true, data: updatedBrand });
	} catch (err) {
		next(err);
	}
};

export const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const identifier = req.params as any as IdentifierDto;
		const brand = await prisma.brand.findUnique({
			where: { id: identifier.id, deleted: false },
		});
		if (!brand) {
			return next(new Error('Brand not found'));
		}
		await prisma.brand.update({
			where: { id: identifier.id },
			data: { deleted: true },
		});
		res.status(200).json({ success: true, message: 'Brand deleted successfully' });
	} catch (err) {
		next(err);
	}
};
