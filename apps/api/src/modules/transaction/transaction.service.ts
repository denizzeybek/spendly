import { Transaction, Category } from '../../models';
import { AppError } from '../../middlewares/error.middleware';
import { CreateTransactionInput, UpdateTransactionInput, ListTransactionsQuery } from './transaction.schema';
import mongoose from 'mongoose';

export class TransactionService {
  async create(input: CreateTransactionInput, userId: string, homeId: string) {
    // Verify category exists and belongs to home
    const category = await Category.findOne({
      _id: input.categoryId,
      homeId: new mongoose.Types.ObjectId(homeId),
    });
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const transaction = await Transaction.create({
      ...input,
      createdById: new mongoose.Types.ObjectId(userId),
      homeId: new mongoose.Types.ObjectId(homeId),
    });

    return transaction.toJSON();
  }

  async list(query: ListTransactionsQuery, homeId: string) {
    const { type, categoryId, month, year, page, limit } = query;

    const filter: Record<string, unknown> = {
      homeId: new mongoose.Types.ObjectId(homeId),
    };

    if (type) {
      filter.type = type;
    }

    if (categoryId) {
      filter.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('categoryId', 'name icon color type')
        .populate('createdById', 'name')
        .populate('assignedCardId', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return {
      data: transactions.map((t) => t.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string, homeId: string) {
    const transaction = await Transaction.findOne({
      _id: id,
      homeId: new mongoose.Types.ObjectId(homeId),
    })
      .populate('categoryId', 'name icon color type')
      .populate('createdById', 'name')
      .populate('assignedCardId', 'name');

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction.toJSON();
  }

  async update(id: string, input: UpdateTransactionInput, homeId: string) {
    // Verify category if provided
    if (input.categoryId) {
      const category = await Category.findOne({
        _id: input.categoryId,
        homeId: new mongoose.Types.ObjectId(homeId),
      });
      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, homeId: new mongoose.Types.ObjectId(homeId) },
      { $set: input },
      { new: true }
    )
      .populate('categoryId', 'name icon color type')
      .populate('createdById', 'name')
      .populate('assignedCardId', 'name');

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction.toJSON();
  }

  async delete(id: string, homeId: string) {
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      homeId: new mongoose.Types.ObjectId(homeId),
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return { id };
  }
}

export const transactionService = new TransactionService();
