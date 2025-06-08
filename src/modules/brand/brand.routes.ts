import express from 'express';
import * as brandController from './brand.controller';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { GetAllBrandsDto } from './dto/get-all-brands.dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = express.Router();

router
	.route('/')
	.get(
		validationMiddleware({ query: [GetAllBrandsDto, GlobalPaginationDto, GlobalSearchDto] }),
		brandController.getAllBrands,
	);

router.route('/:id').get(validationMiddleware({ params: [IdentifierDto] }), brandController.getBrandById);

router.use(protect);

router
	.route('/')
	.post(restrictTo(UserType.ADMIN), validationMiddleware({ body: [CreateBrandDto] }), brandController.createBrand);

router
	.route('/:id')
	.put(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ body: [UpdateBrandDto], params: [IdentifierDto] }),
		brandController.updateBrand,
	)
	.delete(restrictTo(UserType.ADMIN), validationMiddleware({ params: [IdentifierDto] }), brandController.deleteBrand);

export const brandRoutes = router;
