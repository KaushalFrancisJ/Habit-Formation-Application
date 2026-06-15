import type { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import * as authService from '../services/auth.service.js';
import * as authRepo from '../repositories/auth.repository.js';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = registerSchema.parse(req.body);
    const user = await authService.register(input);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.logout(req.session!.sessionToken);
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authRepo.findUserById(req.session!.userId);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      timezone: req.session!.timezone,
    });
  } catch (err) {
    next(err);
  }
};
