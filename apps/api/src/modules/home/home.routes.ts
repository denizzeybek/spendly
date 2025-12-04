import { Router } from 'express';
import { homeController } from './home.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { updateHomeSchema } from './home.schema';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/home:
 *   get:
 *     summary: Get current user's home
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Home details
 */
router.get('/', homeController.getById);

/**
 * @swagger
 * /api/home:
 *   patch:
 *     summary: Update home (owner only)
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               currency:
 *                 type: string
 *                 enum: [TRY, USD, EUR]
 *     responses:
 *       200:
 *         description: Home updated
 */
router.patch('/', validate(updateHomeSchema), homeController.update);

/**
 * @swagger
 * /api/home/users:
 *   get:
 *     summary: Get home users
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of home users
 */
router.get('/users', homeController.getUsers);

/**
 * @swagger
 * /api/home/summary:
 *   get:
 *     summary: Get monthly summary for home
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Monthly summary
 */
router.get('/summary', homeController.getSummary);

/**
 * @swagger
 * /api/home/user-summaries:
 *   get:
 *     summary: Get monthly summary by user
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User summaries
 */
router.get('/user-summaries', homeController.getUserSummaries);

export { router as homeRoutes };
