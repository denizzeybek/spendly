import { Request, Response, NextFunction } from 'express';
import { homeService } from './home.service';
import { sendSuccess } from '../../utils/response';
import { UpdateHomeInput } from './home.schema';

export class HomeController {
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await homeService.getById(req.user!.homeId, req.user!.userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<object, object, UpdateHomeInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await homeService.update(
        req.user!.homeId,
        req.user!.userId,
        req.body
      );
      sendSuccess(res, result, 'Home updated');
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await homeService.getUsers(req.user!.homeId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSummary(
    req: Request<object, object, object, { month?: string; year?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const now = new Date();
      const month = req.query.month ? parseInt(req.query.month) : now.getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();

      const result = await homeService.getSummary(req.user!.homeId, month, year);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getUserSummaries(
    req: Request<object, object, object, { month?: string; year?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const now = new Date();
      const month = req.query.month ? parseInt(req.query.month) : now.getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();

      const result = await homeService.getUserSummaries(req.user!.homeId, month, year);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const homeController = new HomeController();
