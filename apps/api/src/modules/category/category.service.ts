import { Category } from '../../models';
import { AppError } from '../../middlewares/error.middleware';
import { CreateCategoryInput, UpdateCategoryInput, ListCategoriesQuery } from './category.schema';
import { translateCategoryName } from '../../services/translation.service';
import mongoose from 'mongoose';

export class CategoryService {
  async list(query: ListCategoriesQuery, homeId: string) {
    const filter: Record<string, unknown> = {
      homeId: new mongoose.Types.ObjectId(homeId),
    };

    if (query.type) {
      filter.$or = [{ type: query.type }, { type: 'BOTH' }];
    }

    const categories = await Category.find(filter).sort({ isDefault: -1, nameTr: 1 });
    return categories.map((c) => c.toJSON());
  }

  async create(input: CreateCategoryInput, homeId: string) {
    const { name, lang, icon, color, type } = input;

    // Translate the name to the other language
    const { nameTr, nameEn } = await translateCategoryName(name, lang);

    // Check for duplicate name in home (check both languages)
    const existing = await Category.findOne({
      $or: [{ nameTr }, { nameEn }],
      homeId: new mongoose.Types.ObjectId(homeId),
    });
    if (existing) {
      throw new AppError('Category with this name already exists', 409);
    }

    const category = await Category.create({
      nameTr,
      nameEn,
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

    const updateData: Record<string, unknown> = {};

    // Handle name update with translation
    if (input.name && input.lang) {
      const { nameTr, nameEn } = await translateCategoryName(input.name, input.lang);

      // Check for duplicate name (check both languages)
      const existing = await Category.findOne({
        $or: [{ nameTr }, { nameEn }],
        homeId: new mongoose.Types.ObjectId(homeId),
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError('Category with this name already exists', 409);
      }

      updateData.nameTr = nameTr;
      updateData.nameEn = nameEn;
    }

    // Handle other fields
    if (input.icon) updateData.icon = input.icon;
    if (input.color) updateData.color = input.color;
    if (input.type) updateData.type = input.type;

    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
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
