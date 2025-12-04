import { Router } from 'express';
import { categoryController } from './category.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { createCategorySchema, updateCategorySchema, listCategoriesQuerySchema } from './category.schema';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: List categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE, BOTH]
 *     responses:
 *       200:
 *         description: Category list
 */
router.get('/', validate(listCategoriesQuerySchema, 'query'), categoryController.list);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create custom category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - icon
 *               - color
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               lang:
 *                 type: string
 *                 enum: [tr, en]
 *                 default: tr
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE, BOTH]
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/', validate(createCategorySchema), categoryController.create);

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: Update category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lang:
 *                 type: string
 *                 enum: [tr, en]
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE, BOTH]
 *     responses:
 *       200:
 *         description: Category updated
 */
router.patch('/:id', validate(updateCategorySchema), categoryController.update);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete custom category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete('/:id', categoryController.delete);

export { router as categoryRoutes };
