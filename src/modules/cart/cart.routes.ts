import { Router } from 'express';
import * as cartController from './cart.controller';
import { CreateCartDto } from './dto/create-cart.dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { IdentifierDto, IdentifiersDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';

const router = Router();

router.use(protect);

router
	.route('/')
	.get(restrictTo(UserType.USER), cartController.getUserCart)
	.post(restrictTo(UserType.USER), validationMiddleware({ body: [CreateCartDto] }), cartController.addToCart)
	.delete(restrictTo(UserType.USER), cartController.clearCart);

router
	.route('/:id')
	.patch(restrictTo(UserType.USER), validationMiddleware({ params: [IdentifierDto], body: [UpdateCartItemDto] }), cartController.updateCartItem)

router
	.route('/:ids')
	.delete(
		restrictTo(UserType.USER),
		validationMiddleware({ params: [IdentifiersDto] }),
		cartController.removeFromCart,
	);

export const cartRoutes = router;