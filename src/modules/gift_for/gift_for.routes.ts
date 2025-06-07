import express from 'express';
import * as giftForController from './gift_for.controller';
import { CreateGiftForDto } from './dto/create-gift-for.dto';
import { UpdateGiftForDto } from './dto/update-gift-for.dto';
import { GetAllGiftForDto } from './dto/get-all-gift-for.dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .post(
        restrictTo(UserType.ADMIN),
        validationMiddleware({ body: [CreateGiftForDto] }),
        giftForController.createGiftFor
    )
    .get(
        restrictTo(UserType.ADMIN, UserType.USER),
        validationMiddleware({ query: [GetAllGiftForDto, GlobalPaginationDto, GlobalSearchDto] }),
        giftForController.getAllGiftFor
    );

router
    .route('/:id')
    .get(
        restrictTo(UserType.ADMIN, UserType.USER),
        validationMiddleware({ params: [IdentifierDto] }),
        giftForController.getGiftForById
    )
    .put(
        restrictTo(UserType.ADMIN),
        validationMiddleware({ body: [UpdateGiftForDto], params: [IdentifierDto] }),
        giftForController.updateGiftFor
    )
    .delete(
        restrictTo(UserType.ADMIN),
        validationMiddleware({ params: [IdentifierDto] }),
        giftForController.deleteGiftFor
    );

export default router;
