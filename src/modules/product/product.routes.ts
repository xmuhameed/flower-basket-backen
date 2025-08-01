import { Router } from 'express';
import * as productController from './product.controller';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetAllProductsDto } from './dto/get-all-products.dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = Router();

router
	.route('/')
	.get(
		validationMiddleware({ query: [GetAllProductsDto, GlobalPaginationDto, GlobalSearchDto] }),
		productController.getAllProducts,
	);

router.route('/:id').get(validationMiddleware({ params: [IdentifierDto] }), productController.getProductById);

router.use(protect);

router
	.route('/')
	.post(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ body: [CreateProductDto] }),
		productController.createProduct,
	);

router
	.route('/:id')
	.put(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ body: [UpdateProductDto], params: [IdentifierDto] }),
		productController.updateProduct,
	)
	.delete(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ params: [IdentifierDto] }),
		productController.deleteProduct,
	);

export const productRoutes = router;
