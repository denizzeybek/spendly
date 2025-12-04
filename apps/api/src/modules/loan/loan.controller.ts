import { Request, Response, NextFunction } from 'express';
import { loanService } from './loan.service';
import { sendSuccess } from '../../utils/response';
import { CreateLoanInput, UpdateLoanInput, PayInstallmentInput } from './loan.schema';

export class LoanController {
  async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await loanService.list(req.user!.userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await loanService.getById(req.params.id, req.user!.userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request<object, object, CreateLoanInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await loanService.create(req.body, req.user!.userId);
      sendSuccess(res, result, 'Loan created', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<{ id: string }, object, UpdateLoanInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await loanService.update(
        req.params.id,
        req.body,
        req.user!.userId
      );
      sendSuccess(res, result, 'Loan updated');
    } catch (error) {
      next(error);
    }
  }

  async payInstallment(
    req: Request<{ id: string }, object, PayInstallmentInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await loanService.payInstallment(
        req.params.id,
        req.body.count || 1,
        req.user!.userId
      );
      sendSuccess(res, result, 'Installment paid');
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await loanService.delete(req.params.id, req.user!.userId);
      sendSuccess(res, result, 'Loan deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const loanController = new LoanController();
