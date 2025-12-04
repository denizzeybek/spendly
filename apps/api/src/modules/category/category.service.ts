import { Category } from '../../models';
import { AppError } from '../../middlewares/error.middleware';
import { CreateCategoryInput, UpdateCategoryInput, ListCategoriesQuery } from './category.schema';
import mongoose from 'mongoose';

export class CategoryService {
  async list(query: ListCategoriesQuery, homeId: string) {
    const filter: Record<string, unknown> = {
      homeId: new mongoose.Types.ObjectId(homeId),
    };

    if (query.type) {
      filter.$or = [{ type: query.type }, { type: 'BOTH' }];
    }

    const categories = await Category.find(filter).sort({ isDefault: -1, name: 1 });
    return categories.map((c) => c.toJSON());
  }

  async create(input: CreateCategoryInput, homeId: string) {
    const { name, icon, color, type } = input;

    // Check for duplicate name in home
    const existing = await Category.findOne({
      name,
      homeId: new mongoose.Types.ObjectId(homeId),
    });
    if (existing) {
      throw new AppError('Category with this name already exists', 409);
    }

    const category = await Category.create({
      name,
      icon,
      color,
      type,
      isDefault: false,
      homeId: new mongoose.Types.ObjectId(homeId),
    });

    return category.toJSON();
  }

  async update(id: string, input: UpdateCategoryInput, homeId: string) {
    const category = await Category.findOne({
      _id: id,
      homeId: new mongoose.Types.ObjectId(homeId),
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check for duplicate name if updating name
    if (input.name) {
      const existing = await Category.findOne({
        name: input.name,
        homeId: new mongoose.Types.ObjectId(homeId),
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError('Category with this name already exists', 409);
      }
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true }
    );

    return updated!.toJSON();
  }

  async delete(id: string, homeId: string) {
    const category = await Category.findOne({
      _id: id,
      homeId: new mongoose.Types.ObjectId(homeId),
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (category.isDefault) {
      throw new AppError('Cannot delete default category', 400);
    }

    await Category.findByIdAndDelete(id);
    return { id };
  }
}

export const categoryService = new CategoryService();
