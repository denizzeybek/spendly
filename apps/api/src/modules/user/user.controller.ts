import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '../../utils/response';

export class UserController {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.getById(req.user!.userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<object, object, { name?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await userService.update(req.user!.userId, req.body);
      sendSuccess(res, result, 'User updated');
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

      const result = await userService.getSummary(
        req.user!.userId,
        req.user!.homeId,
        month,
        year
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
