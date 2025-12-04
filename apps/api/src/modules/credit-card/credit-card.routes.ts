import { Router } from 'express';
import { creditCardController } from './credit-card.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { createCreditCardSchema, updateCreditCardSchema } from './credit-card.schema';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/credit-cards:
 *   get:
 *     summary: List user's credit cards
 *     tags: [CreditCards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Credit card list
 */
router.get('/', creditCardController.list);

/**
 * @swagger
 * /api/credit-cards:
 *   post:
 *     summary: Create credit card
 *     tags: [CreditCards]
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Credit card created
 */
router.post('/', validate(createCreditCardSchema), creditCardController.create);

/**
 * @swagger
 * /api/credit-cards/{id}:
 *   patch:
 *     summary: Update credit card
 *     tags: [CreditCards]
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
 *     responses:
 *       200:
 *         description: Credit card updated
 */
router.patch('/:id', validate(updateCreditCardSchema), creditCardController.update);

/**
 * @swagger
 * /api/credit-cards/{id}:
 *   delete:
 *     summary: Delete credit card
 *     tags: [CreditCards]
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
 *         description: Credit card deleted
 */
router.delete('/:id', creditCardController.delete);

export { router as creditCardRoutes };
