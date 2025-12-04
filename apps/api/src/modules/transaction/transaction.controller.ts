import { Request, Response, NextFunction } from 'express';
import { transactionService } from './transaction.service';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { CreateTransactionInput, UpdateTransactionInput, ListTransactionsQuery } from './transaction.schema';

export class TransactionController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = req.body as CreateTransactionInput;
      const result = await transactionService.create(
        body,
        req.user!.userId,
        req.user!.homeId
      );
      sendSuccess(res, result, 'Transaction created', 201);
    } catch (error) {
      next(error);
    }
  }

  async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as ListTransactionsQuery;
      const result = await transactionService.list(query, req.user!.homeId);
      sendPaginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await transactionService.getById(req.params.id, req.user!.homeId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = req.body as UpdateTransactionInput;
      const result = await transactionService.update(
        req.params.id,
        body,
        req.user!.homeId
      );
      sendSuccess(res, result, 'Transaction updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await transactionService.delete(req.params.id, req.user!.homeId);
      sendSuccess(res, result, 'Transaction deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
