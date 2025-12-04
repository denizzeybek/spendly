import { Router } from 'express';
import { loanController } from './loan.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { createLoanSchema, updateLoanSchema, payInstallmentSchema } from './loan.schema';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: List user's loans
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Loan list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Loan'
 */
router.get('/', loanController.list);

/**
 * @swagger
 * /api/loans/{id}:
 *   get:
 *     summary: Get loan by ID
 *     tags: [Loans]
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
 *         description: Loan details
 *       404:
 *         description: Loan not found
 */
router.get('/:id', loanController.getById);

/**
 * @swagger
 * /api/loans:
 *   post:
 *     summary: Create loan
 *     tags: [Loans]
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
 *               - totalAmount
 *               - principalAmount
 *               - monthlyPayment
 *               - totalInstallments
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Loan name (e.g., "Car Loan", "Home Mortgage")
 *               totalAmount:
 *                 type: number
 *                 description: Total amount to be paid (principal + interest)
 *               principalAmount:
 *                 type: number
 *                 description: Original borrowed amount
 *               monthlyPayment:
 *                 type: number
 *                 description: Monthly installment amount
 *               totalInstallments:
 *                 type: integer
 *                 description: Total number of installments
 *               paidInstallments:
 *                 type: integer
 *                 description: Number of already paid installments (default 0)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: First payment date
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Last payment date
 *               interestRate:
 *                 type: number
 *                 description: Annual interest rate (optional)
 *               notes:
 *                 type: string
 *                 description: Optional notes
 *     responses:
 *       201:
 *         description: Loan created
 */
router.post('/', validate(createLoanSchema), loanController.create);

/**
 * @swagger
 * /api/loans/{id}:
 *   patch:
 *     summary: Update loan
 *     tags: [Loans]
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
 *               totalAmount:
 *                 type: number
 *               principalAmount:
 *                 type: number
 *               monthlyPayment:
 *                 type: number
 *               totalInstallments:
 *                 type: integer
 *               paidInstallments:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               interestRate:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Loan updated
 */
router.patch('/:id', validate(updateLoanSchema), loanController.update);

/**
 * @swagger
 * /api/loans/{id}/pay:
 *   post:
 *     summary: Mark installment(s) as paid
 *     tags: [Loans]
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
 *             type: object
 *             properties:
 *               count:
 *                 type: integer
 *                 description: Number of installments to mark as paid (default 1)
 *     responses:
 *       200:
 *         description: Installment marked as paid
 */
router.post('/:id/pay', validate(payInstallmentSchema), loanController.payInstallment);

/**
 * @swagger
 * /api/loans/{id}:
 *   delete:
 *     summary: Delete loan
 *     tags: [Loans]
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
 *         description: Loan deleted
 */
router.delete('/:id', loanController.delete);

export { router as loanRoutes };
