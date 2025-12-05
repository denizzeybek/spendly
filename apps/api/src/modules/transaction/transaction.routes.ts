import { Router } from 'express';
import { transactionController } from './transaction.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { createTransactionSchema, createTransferSchema, updateTransactionSchema, listTransactionsQuerySchema } from './transaction.schema';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: List transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE, TRANSFER]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Transaction list
 */
router.get('/', validate(listTransactionsQuerySchema, 'query'), transactionController.list.bind(transactionController));

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - date
 *               - categoryId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *               categoryId:
 *                 type: string
 *               assignedCardId:
 *                 type: string
 *               isShared:
 *                 type: boolean
 *               isRecurring:
 *                 type: boolean
 *               recurringDay:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Transaction created
 */
router.post('/', validate(createTransactionSchema), transactionController.create.bind(transactionController));

/**
 * @swagger
 * /api/transactions/transfer:
 *   post:
 *     summary: Create a transfer between users
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - date
 *               - toUserId
 *             properties:
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *               toUserId:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transfer created
 *       400:
 *         description: Cannot transfer to yourself
 *       404:
 *         description: Recipient not found
 */
router.post('/transfer', validate(createTransferSchema), transactionController.createTransfer.bind(transactionController));

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
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
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', transactionController.getById.bind(transactionController));

/**
 * @swagger
 * /api/transactions/{id}:
 *   patch:
 *     summary: Update transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Transaction updated
 *       404:
 *         description: Transaction not found
 */
router.patch('/:id', validate(updateTransactionSchema), transactionController.update.bind(transactionController));

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete transaction
 *     tags: [Transactions]
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
 *         description: Transaction deleted
 *       404:
 *         description: Transaction not found
 */
router.delete('/:id', transactionController.delete.bind(transactionController));

export { router as transactionRoutes };
