import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { protectedLimiter } from '../middleware/rateLimiter.js';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';

const router = Router();

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary for the authenticated user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats including streaks, missed habits, weekly progress
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', authenticate, protectedLimiter, getDashboardSummary);

export default router;
