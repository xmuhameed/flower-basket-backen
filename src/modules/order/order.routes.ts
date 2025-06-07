import { Router } from 'express';
import * as orderController from './order.controller';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetAllOrdersDto } from './dto/get-all-orders.dto';
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
    validationMiddleware({ body: [CreateOrderDto] }),
    orderController.createOrder
  )
  .get(
    restrictTo(UserType.ADMIN, UserType.USER),
    validationMiddleware({ query: [GetAllOrdersDto, GlobalPaginationDto] }),
    orderController.getAllOrders
  );

router
  .route('/:id')
  .get(
    restrictTo(UserType.ADMIN, UserType.USER),
    validationMiddleware({ params: [IdentifierDto] }),
    orderController.getOrderById
  )
  .put(
    restrictTo(UserType.ADMIN, UserType.USER),
    validationMiddleware({ body: [UpdateOrderDto], params: [IdentifierDto] }),
    orderController.updateOrder
  )
  .delete(
    restrictTo(UserType.ADMIN, UserType.USER),
    validationMiddleware({ params: [IdentifierDto] }),
    orderController.deleteOrder
  );

export default router;
