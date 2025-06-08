import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid/async';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetAllCategoriesDto } from './dto/get-all-categories.dto';
import { checkPagination, GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';

const prisma = new PrismaClient();

import { deleteFile, saveFile } from '../../shared/middleware/save-file.middleware';

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateCategoryDto;
		const uniqueCategoryCode = await nanoid(10);
		const categoryData: Prisma.categoryCreateInput = {
			name: dto.name,
			sort: dto.sort,
			qrcode: uniqueCategoryCode,
		};

		const nestedFolder = `categories/category-${uniqueCategoryCode}`;

		if (req.files?.['category_image']) {
			const result = await saveFile(nestedFolder, req.files['category_image'] as any, {
				prefix: 'category-',
				allowedExtensions: ['.jpg', '.png', '.jpeg'],
			});
			categoryData.category_image_url = result.relativePath;
		}

		const category = await prisma.category.create({ data: categoryData });
		res.status(201).json({ success: true, data: category });
	} catch (err) {
		next(err);
	}
};

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.query as GetAllCategoriesDto;
		const pagination = req.query as GlobalPaginationDto;
		const search = req.query as GlobalSearchDto;
		const whereObj: Prisma.categoryWhereInput = {
			deleted: false,
		};

		if (search.search) {
			whereObj.OR = [
				{
					name: {
						contains: search.search,
					},
				},
			];
		}

		const categories = await prisma.category.findMany({
			where: whereObj,
			orderBy: { sort: 'asc' },
			...checkPagination(pagination),
		});
		const totalCategories = await prisma.category.count({ where: whereObj });
		res.status(200).json({ success: true, count: totalCategories, data: categories });
	} catch (err) {
		next(err);
	}
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.params as any as IdentifierDto;
		const category = await prisma.category.findUnique({
			where: { id: dto.id, deleted: false },
			select: {
				id: true,
				name: true,
				sort: true,
				qrcode: true,
				category_image_url: true,
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
		if (!category) {
			return next(new Error('Category not found'));
		}
		res.status(200).json({ success: true, data: category });
	} catch (err) {
		next(err);
	}
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as UpdateCategoryDto;
		const identifier = req.params as any as IdentifierDto;
		const category = await prisma.category.findUnique({
			where: { id: identifier.id, deleted: false },
		});
		if (!category) {
			return next(new Error('Category not found'));
		}
		const categoryData: Prisma.categoryUpdateInput = {
			...(dto.name && { name: dto.name }),
			...(dto.sort && { sort: dto.sort }),
		};

		// Handle image update
		const nestedFolder = `categories/category-${category.qrcode}`;
		if (req.files?.['category_image']) {
			// Delete old image if exists
			if (category.category_image_url) {
				await deleteFile(category.category_image_url);
			}
			const result = await saveFile(nestedFolder, req.files['category_image'] as any, {
				prefix: 'category-',
				allowedExtensions: ['.jpg', '.png', '.jpeg'],
			});
			categoryData.category_image_url = result.relativePath;
		}

		const updatedCategory = await prisma.category.update({
			where: { id: identifier.id },
			data: categoryData,
		});
		res.status(200).json({ success: true, data: updatedCategory });
	} catch (err) {
		next(err);
	}
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const identifier = req.params as any as IdentifierDto;
		const category = await prisma.category.findUnique({
			where: { id: identifier.id, deleted: false },
		});
		if (!category) {
			return next(new Error('Category not found'));
		}
		await prisma.category.update({
			where: { id: identifier.id },
			data: { deleted: true },
		});
		res.status(200).json({ success: true, message: 'Category deleted successfully' });
	} catch (err) {
		next(err);
	}
};
