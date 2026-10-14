import { Router } from 'express';
import { authRateLimiter } from '../../middlewares/rateLimiter';
import { authenticate } from '../../middlewares/authenticate';
import {
  register,
  login,
  refreshTokens,
  logout,
  recoverPassword,
} from './auth.controller';

export const authRouter = Router();

// Public endpoints — rate-limited
authRouter.post('/register', authRateLimiter, register);
authRouter.post('/login', authRateLimiter, login);
authRouter.post('/refresh', refreshTokens);
authRouter.post('/recover-password', authRateLimiter, recoverPassword);

// Authenticated endpoints
authRouter.post('/logout', authenticate, logout);
