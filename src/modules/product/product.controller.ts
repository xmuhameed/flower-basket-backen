import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid/async';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetAllProductsDto, ProductSortField, SortOrder } from './dto/get-all-products.dto';
import { checkPagination, GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { saveFile, deleteFile } from '../../shared/middleware/save-file.middleware';

const prisma = new PrismaClient();

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateProductDto;

		if (dto.category_id) {
			const category = await prisma.category.findUnique({ where: { id: dto.category_id } });
			if (!category) {
				return next(new Error('Category not found'));
			}
		}
		if (dto.product_type_id) {
			const product_type = await prisma.product_type.findUnique({ where: { id: dto.product_type_id } });
			if (!product_type) {
				return next(new Error('Product type not found'));
			}
		}
		if (dto.collection_id) {
			const collection = await prisma.collection.findUnique({ where: { id: dto.collection_id } });
			if (!collection) {
				return next(new Error('Collection not found'));
			}
		}
		if (dto.gift_for_id) {
			const gift_for = await prisma.gift_for.findUnique({ where: { id: dto.gift_for_id } });
			if (!gift_for) {
				return next(new Error('Gift for not found'));
			}
		}
		if (dto.brand_id) {
			const brand = await prisma.brand.findUnique({ where: { id: dto.brand_id } });
			if (!brand) {
				return next(new Error('Brand not found'));
			}
		}

		const productData: Prisma.productCreateInput = {
			name: dto.name,
			price: dto.price,
			currency: dto.currency as any,
			category: dto.category_id ? { connect: { id: dto.category_id } } : undefined,
			collection: dto.collection_id ? { connect: { id: dto.collection_id } } : undefined,
			gift_for: dto.gift_for_id ? { connect: { id: dto.gift_for_id } } : undefined,
			brand: dto.brand_id ? { connect: { id: dto.brand_id } } : undefined,
			product_type: dto.product_type_id ? { connect: { id: dto.product_type_id } } : undefined,
		};
		const product = await prisma.product.create({ data: productData });
		// Handle images
		const files = req.files?.['product_images'];
		if (files) {
			const images = Array.isArray(files) ? files : [files];
			for (const file of images) {
				const qrcode = await nanoid(10);
				const nestedFolder = `products/product-${product.id}`;
				const result = await saveFile(nestedFolder, file, {
					prefix: 'product-',
					allowedExtensions: ['.jpg', '.png', '.jpeg'],
				});
				await prisma.product_image.create({
					data: {
						qrcode,
						product: { connect: { id: product.id } },
						image_url: result.relativePath,
					},
				});
			}
		}
		const createdProduct = await prisma.product.findUnique({
			where: { id: product.id },
			include: { product_image: true, category: true, collection: true, gift_for: true, brand: true },
		});
		res.status(201).json({ success: true, data: createdProduct });
	} catch (err) {
		next(err);
	}
};

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.query as GetAllProductsDto;
		const pagination = req.query as GlobalPaginationDto;
		const search = req.query as GlobalSearchDto;
		const whereObj: Prisma.productWhereInput = {
			deleted: false,
			...(dto.category_id && { category_id: dto.category_id }),
			...(dto.collection_id && { collection_id: dto.collection_id }),
			...(dto.gift_for_id && { gift_for_id: dto.gift_for_id }),
			...(dto.brand_id && { brand_id: dto.brand_id }),
			...(dto.product_type_id && { product_type_id: dto.product_type_id }),
		};
		if (search.search) {
			whereObj.name = { contains: search.search };
		}
		// Sorting
		let orderBy: any = { name: 'asc' };
		if (dto.sort_by) {
			orderBy = { [dto.sort_by]: dto.order || 'asc' };
		}
		const products = await prisma.product.findMany({
			where: whereObj,
			orderBy,
			...checkPagination(pagination),
			select: {
				id: true,
				name: true,
				price: true,
				currency: true,
				category: { select: { id: true, name: true } },
				collection: { select: { id: true, name: true } },
				gift_for: { select: { id: true, name: true } },
				brand: { select: { id: true, name: true } },
				product_image: { select: { id: true, image_url: true, qrcode: true } },
				createdAt: true,
				updatedAt: true,
			},
		});
		const total = await prisma.product.count({ where: whereObj });
		res.status(200).json({ success: true, count: total, data: products });
	} catch (err) {
		next(err);
	}
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params as unknown as IdentifierDto;
		const product = await prisma.product.findUnique({
			where: { id: id, deleted: false },
			include: {
				product_image: true,
				category: true,
				collection: true,
				gift_for: true,
				brand: true,
				product_type: true,
				user_rate: true,
			},
		});
		if (!product) return next(new Error('Product not found'));
		res.status(200).json({ success: true, data: product });
	} catch (err) {
		next(err);
	}
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params as unknown as IdentifierDto;
		const dto = req.body as UpdateProductDto;

		if (dto.category_id) {
			const category = await prisma.category.findUnique({ where: { id: dto.category_id } });
			if (!category) {
				return next(new Error('Category not found'));
			}
		}
		if (dto.product_type_id) {
			const product_type = await prisma.product_type.findUnique({ where: { id: dto.product_type_id } });
			if (!product_type) {
				return next(new Error('Product type not found'));
			}
		}
		if (dto.collection_id) {
			const collection = await prisma.collection.findUnique({ where: { id: dto.collection_id } });
			if (!collection) {
				return next(new Error('Collection not found'));
			}
		}
		if (dto.gift_for_id) {
			const gift_for = await prisma.gift_for.findUnique({ where: { id: dto.gift_for_id } });
			if (!gift_for) {
				return next(new Error('Gift for not found'));
			}
		}
		if (dto.brand_id) {
			const brand = await prisma.brand.findUnique({ where: { id: dto.brand_id } });
			if (!brand) {
				return next(new Error('Brand not found'));
			}
		}
		// Update product fields
		const productData: Prisma.productUpdateInput = {
			...(dto.name && { name: dto.name }),
			...(dto.price && { price: dto.price }),
			...(dto.currency && { currency: dto.currency as any }),
			...(dto.category_id && { category: { connect: { id: dto.category_id } } }),
			...(dto.collection_id && { collection: { connect: { id: dto.collection_id } } }),
			...(dto.gift_for_id && { gift_for: { connect: { id: dto.gift_for_id } } }),
			...(dto.brand_id && { brand: { connect: { id: dto.brand_id } } }),
			...(dto.product_type_id && { product_type: { connect: { id: dto.product_type_id } } }),
		};
		const product = await prisma.product.update({ where: { id: id }, data: productData });
		// Handle deleted_images
		if (dto.deleted_images && dto.deleted_images.length > 0) {
			for (const imageUrl of dto.deleted_images) {
				const image = await prisma.product_image.findFirst({
					where: { product_id: product.id, image_url: imageUrl },
				});
				if (image) {
					await prisma.product_image.delete({ where: { id: image.id } });
					await deleteFile(imageUrl);
				}
			}
		}
		// Handle new images
		const files = req.files?.['product_images'];
		if (files) {
			const images = Array.isArray(files) ? files : [files];
			for (const file of images) {
				const qrcode = await nanoid(10);
				const nestedFolder = `products/product-${product.id}`;
				const result = await saveFile(nestedFolder, file, {
					prefix: 'product-',
					allowedExtensions: ['.jpg', '.png', '.jpeg'],
				});
				await prisma.product_image.create({
					data: {
						qrcode,
						product: { connect: { id: product.id } },
						image_url: result.relativePath,
					},
				});
			}
		}
		const updatedProduct = await prisma.product.findUnique({
			where: { id: product.id },
			include: { product_image: true, category: true, collection: true, gift_for: true, brand: true },
		});
		res.status(200).json({ success: true, data: updatedProduct });
	} catch (err) {
		next(err);
	}
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params as unknown as IdentifierDto;
		await prisma.product.update({ where: { id: id }, data: { deleted: true } });
		res.status(200).json({ success: true, message: 'Product deleted successfully' });
	} catch (err) {
		next(err);
	}
};
