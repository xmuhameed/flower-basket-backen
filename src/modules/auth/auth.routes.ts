import { Router } from 'express';
import { getProfile, login, register } from './auth.controller';
import { validationMiddleware } from '../../shared/middleware/validation.middleware';
import { LoginDto, RegisterDto, UserType } from './dto/auth.dto';
import { protect, restrictTo } from './auth.middleware';

const router = Router();

router.post('/login', validationMiddleware({ body: [LoginDto] }), login);
router.post('/register', validationMiddleware({ body: [RegisterDto] }), register);

router.use(protect);
router.route('/profile').get(restrictTo(UserType.USER, UserType.ADMIN), getProfile);

export const authRoutes = router;
