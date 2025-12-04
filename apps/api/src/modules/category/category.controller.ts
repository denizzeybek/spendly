import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service';
import { sendSuccess } from '../../utils/response';
import { CreateCategoryInput, UpdateCategoryInput, ListCategoriesQuery } from './category.schema';

export class CategoryController {
  async list(
    req: Request<object, object, object, ListCategoriesQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await categoryService.list(req.query, req.user!.homeId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request<object, object, CreateCategoryInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await categoryService.create(req.body, req.user!.homeId);
      sendSuccess(res, result, 'Category created', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<{ id: string }, object, UpdateCategoryInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await categoryService.update(
        req.params.id,
        req.body,
        req.user!.homeId
      );
      sendSuccess(res, result, 'Category updated');
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
      const result = await categoryService.delete(req.params.id, req.user!.homeId);
      sendSuccess(res, result, 'Category deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
