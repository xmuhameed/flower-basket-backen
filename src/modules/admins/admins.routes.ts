import express from 'express';

import * as adminController from './admins.controller';
import { CreateAdminDto, GetAllAdminsDto, UpdateAdminDto } from './dto';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { GlobalPaginationDto, GlobalSearchDto, IdentifierDto } from '../../shared/global-dto';
import { protect, restrictTo } from '../auth/auth.middleware';
import { UserType } from '../auth/dto';

const router = express.Router();

router.use(protect);

router
	.route('/')
	.post(restrictTo(UserType.ADMIN), validationMiddleware({ body: [CreateAdminDto] }), adminController.createAdmin)
	.get(
        restrictTo(UserType.ADMIN),
		validationMiddleware({ query: [GetAllAdminsDto, GlobalPaginationDto, GlobalSearchDto] }),
		adminController.getAllAdmins,
	);
    

router
	.route('/:id')
	.get(restrictTo(UserType.ADMIN), validationMiddleware({ params: [IdentifierDto] }), adminController.getAdminById)
	.delete(restrictTo(UserType.ADMIN), validationMiddleware({ params: [IdentifierDto] }), adminController.deleteAdmin)
	.patch(
		restrictTo(UserType.ADMIN),
		validationMiddleware({ body: [UpdateAdminDto], params: [IdentifierDto] }),
		adminController.updateAdmin,
	);

export const adminRoutes = router;
