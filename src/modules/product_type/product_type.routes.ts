import express from 'express';
import * as productTypeController from './product_type.controller';
import { CreateProductTypeDto, UpdateProductTypeDto, GetAllProductTypesDto } from './dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = express.Router();

router
    .route('/')
    .get(
        validationMiddleware({ query: [GetAllProductTypesDto, GlobalPaginationDto, GlobalSearchDto] }),
        productTypeController.getAllProductTypes,
    );

router.route('/:id').get(validationMiddleware({ params: [IdentifierDto] }), productTypeController.getProductTypeById);

router.use(protect);

router
    .route('/')
    .post(
        restrictTo(UserType.ADMIN),
        validationMiddleware({ body: [CreateProductTypeDto] }),
        productTypeController.createProductType,
    );

router
    .route('/:id')
    .put(
        restrictTo(UserType.ADMIN),
        validationMiddleware({ body: [UpdateProductTypeDto], params: [IdentifierDto] }),
        productTypeController.updateProductType,
    )
    .delete(
        restrictTo(UserType.ADMIN),
        validationMiddleware({ params: [IdentifierDto] }),
        productTypeController.deleteProductType,
    );

export const productTypeRoutes = router;
