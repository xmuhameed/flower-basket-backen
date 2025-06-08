import express from 'express';
import * as categoryController from './category.controller';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetAllCategoriesDto } from './dto/get-all-categories.dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = express.Router();

router
	.route('/')
	.get(
		validationMiddleware({ query: [GetAllCategoriesDto, GlobalPaginationDto, GlobalSearchDto] }),
		categoryController.getAllCategories,
	);

router.route('/:id').get(validationMiddleware({ params: [IdentifierDto] }), categoryController.getCategoryById);

router.use(protect);

router
	.route('/')
	.post(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ body: [CreateCategoryDto] }),
		categoryController.createCategory,
	);

router
	.route('/:id')
	.put(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ body: [UpdateCategoryDto], params: [IdentifierDto] }),
		categoryController.updateCategory,
	)
	.delete(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ params: [IdentifierDto] }),
		categoryController.deleteCategory,
	);

export const categoryRoutes = router;
