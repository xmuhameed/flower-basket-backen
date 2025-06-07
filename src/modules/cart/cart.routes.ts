import { Router } from 'express';
import * as cartController from './cart.controller';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { GetAllCartsDto } from './dto/get-all-carts.dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = Router();

router.use(protect);

router
  .route('/')
  .post(
    restrictTo(UserType.ADMIN, UserType.USER),
    validationMiddleware({ body: [CreateCartDto] }),
    cartController.createCart
  )
  .get(
    restrictTo(UserType.ADMIN, UserType.USER),
    validationMiddleware({ query: [GetAllCartsDto, GlobalPaginationDto] }),
    cartController.getAllCarts
  );

router
  .route('/:id')
  .get(
    restrictTo(UserType.ADMIN, UserType.USER),
    validationMiddleware({ params: [IdentifierDto] }),
    cartController.getCartById
  )
  .put(
    restrictTo(UserType.ADMIN, UserType.USER),
    validationMiddleware({ body: [UpdateCartDto], params: [IdentifierDto] }),
    cartController.updateCart
  )
  .delete(
    restrictTo(UserType.ADMIN, UserType.USER),
    validationMiddleware({ params: [IdentifierDto] }),
    cartController.deleteCart
  );

export default router;
