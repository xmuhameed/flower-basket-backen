import express from 'express';
import * as addressController from './address.controller';
import { CreateAddressDto, GetAllAddressesDto, UpdateAddressDto } from './dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .post(
        restrictTo(UserType.ADMIN, UserType.USER),
        validationMiddleware({ body: [CreateAddressDto] }),
        addressController.createAddress
    )
    .get(
        restrictTo(UserType.ADMIN, UserType.USER),
        validationMiddleware({ query: [GetAllAddressesDto, GlobalPaginationDto, GlobalSearchDto] }),
        addressController.getAllAddresses
    );

router
    .route('/:id')
    .get(
        restrictTo(UserType.ADMIN, UserType.USER),
        validationMiddleware({ params: [IdentifierDto] }),
        addressController.getAddressById
    )
    .delete(
        restrictTo(UserType.ADMIN, UserType.USER),
        validationMiddleware({ params: [IdentifierDto] }),
        addressController.deleteAddress
    )
    .patch(
        restrictTo(UserType.ADMIN, UserType.USER),
        validationMiddleware({ body: [UpdateAddressDto], params: [IdentifierDto] }),
        addressController.updateAddress
    );

export const addressRoutes = router;
