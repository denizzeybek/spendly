import { Request, Response, NextFunction } from 'express';
import { creditCardService } from './credit-card.service';
import { sendSuccess } from '../../utils/response';
import { CreateCreditCardInput, UpdateCreditCardInput } from './credit-card.schema';

export class CreditCardController {
  async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await creditCardService.list(req.user!.userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request<object, object, CreateCreditCardInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await creditCardService.create(req.body, req.user!.userId);
      sendSuccess(res, result, 'Credit card created', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<{ id: string }, object, UpdateCreditCardInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await creditCardService.update(
        req.params.id,
        req.body,
        req.user!.userId
      );
      sendSuccess(res, result, 'Credit card updated');
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
      const result = await creditCardService.delete(req.params.id, req.user!.userId);
      sendSuccess(res, result, 'Credit card deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const creditCardController = new CreditCardController();
