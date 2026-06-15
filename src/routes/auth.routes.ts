import { Router } from 'express';
import { register, login, logout, me } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { publicLimiter, protectedLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 description: Min 8 chars, 2 numbers, 1 special character
 *               timezone:
 *                 type: string
 *                 example: Asia/Kolkata
 *     responses:
 *       201:
 *         description: User registered
 *       409:
 *         description: Email already in use
 */
router.post('/register', publicLimiter, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               timezone:
 *                 type: string
 *                 example: Asia/Kolkata
 *     responses:
 *       200:
 *         description: Returns JWT token and user info
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', publicLimiter, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout current session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticate, protectedLimiter, logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, protectedLimiter, me);

export default router;
