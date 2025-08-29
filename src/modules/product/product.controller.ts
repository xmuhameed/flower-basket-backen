import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid/async';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetAllProductsDto, ProductSortField, SortOrder } from './dto/get-all-products.dto';
import { checkPagination, GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { saveFile, deleteFile } from '../../shared/middleware/save-file.middleware';

const prisma = new PrismaClient();

export const productSelect = {
	id: true,
	name: true,
	name_ar: true,
	price: true,
	currency: true,
	color: true,
	fast_delivery: true,
	product_image: { select: { id: true, image_url: true, qrcode: true } },
	brand: { select: { id: true, name: true, name_ar: true } },
	product_type: { select: { id: true, name: true, name_ar: true } },
	collection: { select: { id: true, name: true, name_ar: true } },
	product_category_relation: { select: { id: true, category: { select: { id: true, name: true, name_ar: true } } } },
	product_gift_for_relation: { select: { id: true, gift_for: { select: { id: true, name: true, name_ar: true } } } },
};

const oneProductSelect = {
	...productSelect,
	description: true,
	how_to_care: true,
	content: true,
	alert: true,
	dimensions: true,
	user_rate: { select: { id: true, user_id: true, rate: true, rate_text: true } },
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const dto = req.body as CreateProductDto;


		if (dto.category_ids) {
			const categories = await prisma.category.findMany({
				where: { id: { in: dto.category_ids }, deleted: false },
			});
			if (categories.length !== dto.category_ids.length) {
				return next(new Error('Some categories not found'));
			}
		}
		if (dto.gift_for_ids) {
			const gift_fors = await prisma.gift_for.findMany({
				where: { id: { in: dto.gift_for_ids }, deleted: false },
			});
			if (gift_fors.length !== dto.gift_for_ids.length) {
				return next(new Error('Some gift fors not found'));
			}
		}
		if (dto.product_type_id) {
			const product_type = await prisma.product_type.findUnique({
				where: { id: dto.product_type_id, deleted: false },
			});
			if (!product_type) {
				return next(new Error('Product type not found'));
			}
		}
		if (dto.collection_id) {
			const collection = await prisma.collection.findUnique({
				where: { id: dto.collection_id, deleted: false },
			});
			if (!collection) {
				return next(new Error('Collection not found'));
			}
		}
		if (dto.brand_id) {
			const brand = await prisma.brand.findUnique({ where: { id: dto.brand_id, deleted: false } });
			if (!brand) {
				return next(new Error('Brand not found'));
			}
		}

		const productData: Prisma.productCreateInput = {
			name: dto.name,
			name_ar: dto.name_ar,
			price: dto.price,
			currency: dto.currency as any,
			collection: dto.collection_id ? { connect: { id: dto.collection_id } } : undefined,
			collection_index: dto.collection_index,
			brand: dto.brand_id ? { connect: { id: dto.brand_id } } : undefined,
			product_type: dto.product_type_id ? { connect: { id: dto.product_type_id } } : undefined,
			description: dto.description,
			how_to_care: dto.how_to_care,
			content: dto.content,
			alert: dto.alert,
			dimensions: dto.dimensions,
			fast_delivery: dto.fast_delivery,
			color: dto.color,
			// gift_for: dto.gift_for_id ? { connect: { id: dto.gift_for_id } } : undefined,
			// category: dto.category_id ? { connect: { id: dto.category_id } } : undefined,
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
		if (dto.category_ids) {
			await prisma.product_category_relation.createMany({
				data: dto.category_ids.map((category_id) => ({ product_id: product.id, category_id })),
			});
		}
		if (dto.gift_for_ids) {
			await prisma.product_gift_for_relation.createMany({
				data: dto.gift_for_ids.map((gift_for_id) => ({ product_id: product.id, gift_for_id })),
			});
		}
		const createdProduct = await prisma.product.findUnique({
			where: { id: product.id },
			// include: { product_image: true, category: true, collection: true, gift_for: true, brand: true },
			select: oneProductSelect,
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
			// ...(dto.category_id && { category_id: dto.category_id }),
			// ...(dto.collection_id && { collection_id: dto.collection_id }),
			// ...(dto.gift_for_id && { gift_for_id: dto.gift_for_id }),
			// ...(dto.brand_id && { brand_id: dto.brand_id }),
			// ...(dto.product_type_id && { product_type_id: dto.product_type_id }),
		};
		if (dto.collection_ids) {
			whereObj.collection_id = { in: dto.collection_ids };
		}
		if (dto.brand_ids) {
			whereObj.brand_id = { in: dto.brand_ids };
		}
		if (dto.product_type_ids) {
			whereObj.product_type_id = { in: dto.product_type_ids };
		}
		if (dto.category_ids) {
			whereObj.product_category_relation = {
				some: {
					category_id: { in: dto.category_ids },
				},
			};
		}
		if (dto.gift_for_ids) {
			whereObj.product_gift_for_relation = {
				some: {
					gift_for_id: { in: dto.gift_for_ids },
				},
			};
		}
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
			select: productSelect,
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
			select: oneProductSelect,
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

		if (dto.category_ids) {
			const categories = await prisma.category.findMany({
				where: { id: { in: dto.category_ids }, deleted: false },
			});
			if (categories.length !== dto.category_ids.length) {
				return next(new Error('Some categories not found'));
			}
		}
		if (dto.gift_for_ids) {
			const gift_fors = await prisma.gift_for.findMany({
				where: { id: { in: dto.gift_for_ids }, deleted: false },
			});
			if (gift_fors.length !== dto.gift_for_ids.length) {
				return next(new Error('Some gift fors not found'));
			}
		}
		if (dto.product_type_id) {
			const product_type = await prisma.product_type.findUnique({
				where: { id: dto.product_type_id, deleted: false },
			});
			if (!product_type) {
				return next(new Error('Product type not found'));
			}
		}
		if (dto.collection_id) {
			const collection = await prisma.collection.findUnique({
				where: { id: dto.collection_id, deleted: false },
			});
			if (!collection) {
				return next(new Error('Collection not found'));
			}
		}
		if (dto.brand_id) {
			const brand = await prisma.brand.findUnique({ where: { id: dto.brand_id, deleted: false } });
			if (!brand) {
				return next(new Error('Brand not found'));
			}
		}
		// Update product fields
		const productData: Prisma.productUpdateInput = {
			...(dto.name && { name: dto.name }),
			...(dto.name_ar && { name_ar: dto.name_ar }),
			...(dto.color && { color: dto.color }),
			...(dto.fast_delivery && { fast_delivery: dto.fast_delivery }),
			...(dto.description && { description: dto.description }),
			...(dto.how_to_care && { how_to_care: dto.how_to_care }),
			...(dto.content && { content: dto.content }),
			...(dto.price && { price: dto.price }),
			...(dto.currency && { currency: dto.currency as any }),
			...(dto.collection_id && { collection: { connect: { id: dto.collection_id } } }),
			...(dto.collection_index && { collection_index: dto.collection_index }),
			...(dto.brand_id && { brand: { connect: { id: dto.brand_id } } }),
			...(dto.product_type_id && { product_type: { connect: { id: dto.product_type_id } } }),
			// ...(dto.gift_for_id && { gift_for: { connect: { id: dto.gift_for_id } } }),
			// ...(dto.category_id && { category: { connect: { id: dto.category_id } } }),
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
		if (dto.category_ids) {
			const all_category_relations =
				(await prisma.product_category_relation.findMany({ where: { product_id: product.id } })) || [];
			const new_category_relations =
				dto.category_ids.filter(
					(category_id) => !all_category_relations.some((relation) => relation.category_id === category_id),
				) || [];
			const deleted_category_relations =
				all_category_relations.filter((relation) => !dto.category_ids.includes(relation.category_id)) || [];

			if (new_category_relations.length > 0) {
				await prisma.product_category_relation.createMany({
					data: new_category_relations.map((category_id) => ({ product_id: product.id, category_id })),
				});
			}

			if (deleted_category_relations.length > 0) {
				await prisma.product_category_relation.deleteMany({
					where: { id: { in: deleted_category_relations.map((relation) => relation.id) } },
				});
			}

			// await prisma.product_category_relation.updateMany({ where: { product_id: product.id }, data: { sort
			dto.category_ids.forEach(async (category_id, index) => {
				await prisma.product_category_relation.updateMany({
					where: { product_id: product.id, category_id: category_id },
					data: { sort: index },
				});
			});
		}

		if (dto.gift_for_ids) {
			const all_gift_for_relations =
				(await prisma.product_gift_for_relation.findMany({ where: { product_id: product.id } })) || [];
			const new_gift_for_relations =
				dto.gift_for_ids.filter(
					(gift_for_id) => !all_gift_for_relations.some((relation) => relation.gift_for_id === gift_for_id),
				) || [];
			const deleted_gift_for_relations =
				all_gift_for_relations.filter((relation) => !dto.gift_for_ids.includes(relation.gift_for_id)) || [];

			if (new_gift_for_relations.length > 0) {
				await prisma.product_gift_for_relation.createMany({
					data: new_gift_for_relations.map((gift_for_id) => ({ product_id: product.id, gift_for_id })),
				});
			}

			if (deleted_gift_for_relations.length > 0) {
				await prisma.product_gift_for_relation.deleteMany({
					where: { id: { in: deleted_gift_for_relations.map((relation) => relation.id) } },
				});
			}

			dto.gift_for_ids.forEach(async (gift_for_id, index) => {
				await prisma.product_gift_for_relation.updateMany({
					where: { product_id: product.id, gift_for_id: gift_for_id },
					data: { sort: index },
				});
			});
		}

		const updatedProduct = await prisma.product.findUnique({
			where: { id: product.id },
			select: oneProductSelect,
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
