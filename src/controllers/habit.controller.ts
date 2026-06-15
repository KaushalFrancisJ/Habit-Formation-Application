import type { Request, Response, NextFunction } from 'express';
import { createHabitSchema, updateHabitSchema, completeHabitSchema } from '../validators/habit.validator.js';
import * as habitService from '../services/habit.service.js';
import * as completionService from '../services/completion.service.js';
import type { UserHabitStatus } from '../db/models/UserHabit.js';

export const createHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = createHabitSchema.parse(req.body);
    const result = await habitService.createHabit(req.session!.userId, input);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

export const listHabits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = (req.query.status as UserHabitStatus) ?? 'ACTIVE';
    const habits = await habitService.listHabits(req.session!.userId, status);
    res.json(habits);
  } catch (err) { next(err); }
};

export const getHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await habitService.getHabitWithStats(
      parseInt(req.params.id, 10),
      req.session!.userId,
      req.session!.timezone
    );
    res.json(result);
  } catch (err) { next(err); }
};

export const updateHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = updateHabitSchema.parse(req.body);
    const result = await habitService.updateHabit(parseInt(req.params.id, 10), req.session!.userId, input);
    res.json(result);
  } catch (err) { next(err); }
};

export const deleteHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await habitService.deleteHabit(parseInt(req.params.id, 10), req.session!.userId);
    res.json({ message: 'Habit deleted' });
  } catch (err) { next(err); }
};

export const completeHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = completeHabitSchema.parse(req.body);
    const userHabit = await habitService.getHabit(parseInt(req.params.id, 10), req.session!.userId);
    const completion = await completionService.logCompletion(userHabit, input, req.session!.timezone);
    res.status(201).json(completion);
  } catch (err) { next(err); }
};

export const getCompletions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userHabit = await habitService.getHabit(parseInt(req.params.id, 10), req.session!.userId);
    const completions = await completionService.getCompletions(userHabit.id);
    res.json(completions);
  } catch (err) { next(err); }
};
