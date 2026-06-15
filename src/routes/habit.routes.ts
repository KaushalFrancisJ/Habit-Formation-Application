import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { protectedLimiter } from '../middleware/rateLimiter.js';
import {
  createHabit, listHabits, getHabit, updateHabit, deleteHabit,
  completeHabit, getCompletions,
} from '../controllers/habit.controller.js';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(authenticate, protectedLimiter);

/**
 * @swagger
 * tags:
 *   - name: Habits
 *     description: Habit management
 *   - name: Dashboard
 *     description: Dashboard summary
 */

/**
 * @swagger
 * /api/habits:
 *   post:
 *     summary: Create a new habit
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, difficulty_level, frequency_type, target_frequency]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               estimated_duration_minutes:
 *                 type: integer
 *               difficulty_level:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD]
 *               frequency_type:
 *                 type: string
 *                 enum: [DAILY, WEEKLY]
 *               target_frequency:
 *                 type: integer
 *               grace_period_hours:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Habit created
 *       401:
 *         description: Unauthorized
 */
router.post('/', createHabit);

/**
 * @swagger
 * /api/habits:
 *   get:
 *     summary: List user habits
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, PAUSED, COMPLETED, ARCHIVED]
 *         description: Filter by status (default ACTIVE)
 *     responses:
 *       200:
 *         description: List of habits
 */
router.get('/', listHabits);

/**
 * @swagger
 * /api/habits/{id}:
 *   get:
 *     summary: Get a habit with streak and missed stats
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Habit with stats
 *       404:
 *         description: Not found
 */
router.get('/:id', getHabit);

/**
 * @swagger
 * /api/habits/{id}:
 *   put:
 *     summary: Update a habit
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, PAUSED, COMPLETED, ARCHIVED]
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.put('/:id', updateHabit);

/**
 * @swagger
 * /api/habits/{id}:
 *   delete:
 *     summary: Soft delete a habit
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', deleteHabit);

/**
 * @swagger
 * /api/habits/{id}/complete:
 *   post:
 *     summary: Log a habit completion
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [completed_at]
 *             properties:
 *               completed_at:
 *                 type: string
 *                 format: date-time
 *               started_at:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Completion logged
 *       409:
 *         description: Already completed
 */
router.post('/:id/complete', completeHabit);

/**
 * @swagger
 * /api/habits/{id}/completions:
 *   get:
 *     summary: Get all completions for a habit
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of completions
 */
router.get('/:id/completions', getCompletions);

export default router;
