import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid/async';
import { CreateHomeSliderDto } from './dto/create-home-slider.dto';
import { UpdateHomeSliderDto } from './dto/update-home-slider.dto';
import { GetAllHomeSlidersDto } from './dto/get-all-home-sliders.dto';
import { checkPagination, GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { deleteFile, saveFile } from '../../shared/middleware/save-file.middleware';

const prisma = new PrismaClient();

export const createHomeSlider = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = req.body as CreateHomeSliderDto;
        const uniqueSliderCode = await nanoid(10);
        const sliderData: Prisma.home_sliderCreateInput = {
            name: dto.name,
            sort: dto.sort,
            qrcode: uniqueSliderCode,
            button_text: dto.button_text,
            button_url: dto.button_url,
        };
        const nestedFolder = `home_sliders/slider-${uniqueSliderCode}`;
        if (req.files?.['slider_image']) {
            const result = await saveFile(nestedFolder, req.files['slider_image'] as any, {
                prefix: 'slider-',
                allowedExtensions: ['.jpg', '.png', '.jpeg'],
            });
            sliderData.slider_image_url = result.relativePath;
        }
        const slider = await prisma.home_slider.create({ data: sliderData });
        res.status(201).json({ success: true, data: slider });
    } catch (err) {
        next(err);
    }
};

export const getAllHomeSliders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const dto = req.query as GetAllHomeSlidersDto;
        const pagination = req.query as GlobalPaginationDto;
        const search = req.query as GlobalSearchDto;
        const whereObj: Prisma.home_sliderWhereInput = {
            deleted: false,
        };
        if (search.search) {
            whereObj.OR = [
                { name: { contains: search.search } },
            ];
        }
        const sliders = await prisma.home_slider.findMany({
            where: whereObj,
            orderBy: { sort: 'asc' },
            ...checkPagination(pagination),
        });
        const totalSliders = await prisma.home_slider.count({ where: whereObj });
        res.status(200).json({ success: true, count: totalSliders, data: sliders });
    } catch (err) {
        next(err);
    }
};

export const getHomeSliderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = req.params as any as IdentifierDto;
        const slider = await prisma.home_slider.findUnique({
            where: { id: dto.id, deleted: false },
        });
        if (!slider) {
            return next(new Error('HomeSlider not found'));
        }
        res.status(200).json({ success: true, data: slider });
    } catch (err) {
        next(err);
    }
};

export const updateHomeSlider = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = req.body as UpdateHomeSliderDto;
        const identifier = req.params as any as IdentifierDto;
        const slider = await prisma.home_slider.findUnique({
            where: { id: identifier.id, deleted: false },
        });
        if (!slider) {
            return next(new Error('HomeSlider not found'));
        }
        const sliderData: Prisma.home_sliderUpdateInput = {
            ...(dto.name && { name: dto.name }),
            ...(dto.sort && { sort: dto.sort }),
            ...(dto.button_text && { button_text: dto.button_text }),
            ...(dto.button_url && { button_url: dto.button_url }),
        };
        const nestedFolder = `home_sliders/slider-${slider.qrcode}`;
        if (req.files?.['slider_image']) {
            if (slider.slider_image_url) {
                await deleteFile(slider.slider_image_url);
            }
            const result = await saveFile(nestedFolder, req.files['slider_image'] as any, {
                prefix: 'slider-',
                allowedExtensions: ['.jpg', '.png', '.jpeg'],
            });
            sliderData.slider_image_url = result.relativePath;
        }
        const updatedSlider = await prisma.home_slider.update({
            where: { id: identifier.id },
            data: sliderData,
        });
        res.status(200).json({ success: true, data: updatedSlider });
    } catch (err) {
        next(err);
    }
};

export const deleteHomeSlider = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const identifier = req.params as any as IdentifierDto;
        const slider = await prisma.home_slider.findUnique({
            where: { id: identifier.id, deleted: false },
        });
        if (!slider) {
            return next(new Error('HomeSlider not found'));
        }
        await prisma.home_slider.update({
            where: { id: identifier.id },
            data: { deleted: true },
        });
        res.status(200).json({ success: true, message: 'HomeSlider deleted successfully' });
    } catch (err) {
        next(err);
    }
};
