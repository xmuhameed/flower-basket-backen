import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid/async';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { GetAllCollectionsDto } from './dto/get-all-collections.dto';
import { checkPagination, GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { deleteFile, saveFile } from '../../shared/middleware/save-file.middleware';

const prisma = new PrismaClient();

export const createCollection = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateCollectionDto;
		const uniqueCollectionCode = await nanoid(10);
		const collectionData: Prisma.collectionCreateInput = {
			name: dto.name,
			sort: dto.sort,
			qrcode: uniqueCollectionCode,
		};
		const nestedFolder = `collections/collection-${uniqueCollectionCode}`;
		if (req.files?.['collection_image']) {
			const result = await saveFile(nestedFolder, req.files['collection_image'] as any, {
				prefix: 'collection-',
				allowedExtensions: ['.jpg', '.png', '.jpeg'],
			});
			collectionData.collection_image_url = result.relativePath;
		}
		const collection = await prisma.collection.create({ data: collectionData });
		res.status(201).json({ success: true, data: collection });
	} catch (err) {
		next(err);
	}
};

export const getAllCollections = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const dto = req.query as GetAllCollectionsDto;
		const pagination = req.query as GlobalPaginationDto;
		const search = req.query as GlobalSearchDto;
		const whereObj: Prisma.collectionWhereInput = {
			deleted: false,
		};
		if (search.search) {
			whereObj.OR = [{ name: { contains: search.search } }];
		}
		const collections = await prisma.collection.findMany({
			where: whereObj,
			orderBy: { sort: 'asc' },
			...checkPagination(pagination),
		});
		const totalCollections = await prisma.collection.count({ where: whereObj });
		res.status(200).json({ success: true, count: totalCollections, data: collections });
	} catch (err) {
		next(err);
	}
};

export const getCollectionById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.params as any as IdentifierDto;
		const collection = await prisma.collection.findUnique({
			where: { id: dto.id, deleted: false },
		});
		if (!collection) {
			return next(new Error('Collection not found'));
		}
		res.status(200).json({ success: true, data: collection });
	} catch (err) {
		next(err);
	}
};

export const updateCollection = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as UpdateCollectionDto;
		const identifier = req.params as any as IdentifierDto;
		const collection = await prisma.collection.findUnique({
			where: { id: identifier.id, deleted: false },
		});
		if (!collection) {
			return next(new Error('Collection not found'));
		}
		const collectionData: Prisma.collectionUpdateInput = {
			...(dto.name && { name: dto.name }),
			...(dto.sort && { sort: dto.sort }),
		};
		const nestedFolder = `collections/collection-${collection.qrcode}`;
		if (req.files?.['collection_image']) {
			if (collection.collection_image_url) {
				await deleteFile(collection.collection_image_url);
			}
			const result = await saveFile(nestedFolder, req.files['collection_image'] as any, {
				prefix: 'collection-',
				allowedExtensions: ['.jpg', '.png', '.jpeg'],
			});
			collectionData.collection_image_url = result.relativePath;
		}
		const updatedCollection = await prisma.collection.update({
			where: { id: identifier.id },
			data: collectionData,
		});
		res.status(200).json({ success: true, data: updatedCollection });
	} catch (err) {
		next(err);
	}
};

export const deleteCollection = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const identifier = req.params as any as IdentifierDto;
		const collection = await prisma.collection.findUnique({
			where: { id: identifier.id, deleted: false },
		});
		if (!collection) {
			return next(new Error('Collection not found'));
		}
		await prisma.collection.update({
			where: { id: identifier.id },
			data: { deleted: true },
		});
		res.status(200).json({ success: true, message: 'Collection deleted successfully' });
	} catch (err) {
		next(err);
	}
};
