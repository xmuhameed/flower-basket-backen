import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid/async';
import { CreateProductTypeDto, UpdateProductTypeDto, GetAllProductTypesDto } from './dto';
import { checkPagination, GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { deleteFile, saveFile } from '../../shared/middleware/save-file.middleware';

const prisma = new PrismaClient();

export const createProductType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = req.body as CreateProductTypeDto;
        const uniqueProductTypeCode = await nanoid(10);
        const productTypeData: Prisma.product_typeCreateInput = {
            name: dto.name,
            name_ar: dto.name_ar,
            sort: dto.sort,
            qrcode: uniqueProductTypeCode,
        };

        const nestedFolder = `product-types/product-type-${uniqueProductTypeCode}`;

        if (req.files?.['product_type_image']) {
            const result = await saveFile(nestedFolder, req.files['product_type_image'] as any, {
                prefix: 'product-type-',
                allowedExtensions: ['.jpg', '.png', '.jpeg'],
            });
            productTypeData.product_type_image_url = result.relativePath;
        }

        const productType = await prisma.product_type.create({ data: productTypeData });
        res.status(201).json({ success: true, data: productType });
    } catch (err) {
        next(err);
    }
};

export const getAllProductTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = req.query as GetAllProductTypesDto;
        const pagination = req.query as GlobalPaginationDto;
        const search = req.query as GlobalSearchDto;
        const whereObj: Prisma.product_typeWhereInput = {
            deleted: false,
        };
        if (search.search) {
            whereObj.OR = [
                {
                    name: {
                        contains: search.search,
                    },
                    name_ar: {
                        contains: search.search,
                    },
                },
            ];
        }
        const productTypes = await prisma.product_type.findMany({
            where: whereObj,
            orderBy: { sort: 'asc' },
            ...checkPagination(pagination),
        });
        res.status(200).json({ success: true, data: productTypes });
    } catch (err) {
        next(err);
    }
};

export const getProductTypeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as unknown as IdentifierDto;
        const productType = await prisma.product_type.findUnique({
            where: { id: Number(id), deleted: false },
        });
        if (!productType) {
            return next(new Error('Product type not found'));
        }
        res.status(200).json({ success: true, data: productType });
    } catch (err) {
        next(err);
    }
};

export const updateProductType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as unknown as IdentifierDto;
        const dto = req.body as UpdateProductTypeDto;
        
        const productType = await prisma.product_type.findUnique({
            where: { id: Number(id), deleted: false },
        });
        
        if (!productType) {
            return next(new Error('Product type not found'));
        }

        const productTypeData: Prisma.product_typeUpdateInput = {
            ...(dto.name && { name: dto.name }),
            ...(dto.name_ar && { name_ar: dto.name_ar }),
            ...(dto.sort && { sort: dto.sort }),
        };

        // Handle image update
        const nestedFolder = `product-types/product-type-${productType.qrcode}`;
        if (req.files?.['product_type_image']) {
            // Delete old image if exists
            if (productType.product_type_image_url) {
                await deleteFile(productType.product_type_image_url);
            }
            const result = await saveFile(nestedFolder, req.files['product_type_image'] as any, {
                prefix: 'product-type-',
                allowedExtensions: ['.jpg', '.png', '.jpeg'],
            });
            productTypeData.product_type_image_url = result.relativePath;
        }

        const updatedProductType = await prisma.product_type.update({
            where: { id: Number(id) },
            data: productTypeData,
        });
        res.status(200).json({ success: true, data: updatedProductType });
        
    } catch (err) {
        next(err);
    }
};

export const deleteProductType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params as unknown as IdentifierDto;
        await prisma.product_type.update({
            where: { id: Number(id) },
            data: { deleted: true },
        });
        res.status(200).json({ success: true, message: 'Product type deleted' });
    } catch (err) {
        next(err);
    }
};
