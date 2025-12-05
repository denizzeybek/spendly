import { Transaction, Category, User } from '../../models';
import { AppError } from '../../middlewares/error.middleware';
import { CreateTransactionInput, CreateTransferInput, UpdateTransactionInput, ListTransactionsQuery } from './transaction.schema';
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

  async list(query: ListTransactionsQuery, homeId: string, userId: string) {
    const { type, categoryId, month, year, page, limit } = query;
    const homeObjectId = new mongoose.Types.ObjectId(homeId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Build base filter
    const baseFilter: Record<string, unknown> = {
      homeId: homeObjectId,
    };

    if (categoryId) {
      baseFilter.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      baseFilter.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      baseFilter.date = { $gte: startDate, $lte: endDate };
    }

    // For transfers, only show transactions where user is sender or receiver
    // For non-transfers, show all transactions in home
    let filter: Record<string, unknown>;

    if (type === 'TRANSFER') {
      // Only show transfers where user is involved
      filter = {
        ...baseFilter,
        type: 'TRANSFER',
        $or: [{ fromUserId: userObjectId }, { toUserId: userObjectId }],
        // Only show one transaction per transfer (the one created by sender)
        createdById: { $exists: true },
      };
    } else if (type) {
      filter = { ...baseFilter, type };
    } else {
      // All types - but filter transfers to only show relevant ones
      filter = {
        ...baseFilter,
        $or: [
          { type: { $ne: 'TRANSFER' } },
          { type: 'TRANSFER', fromUserId: userObjectId },
          { type: 'TRANSFER', toUserId: userObjectId },
        ],
      };
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('categoryId', 'name icon color type')
        .populate('createdById', 'name')
        .populate('assignedCardId', 'name')
        .populate('fromUserId', 'name')
        .populate('toUserId', 'name')
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
    const transaction = await Transaction.findOne({
      _id: id,
      homeId: new mongoose.Types.ObjectId(homeId),
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    await Transaction.findByIdAndDelete(id);

    return { id };
  }

  async createTransfer(input: CreateTransferInput, fromUserId: string, homeId: string) {
    const homeObjectId = new mongoose.Types.ObjectId(homeId);
    const fromUserObjectId = new mongoose.Types.ObjectId(fromUserId);
    const toUserObjectId = new mongoose.Types.ObjectId(input.toUserId);

    // Verify toUser exists and belongs to same home
    const toUser = await User.findOne({
      _id: toUserObjectId,
      homeId: homeObjectId,
    });
    if (!toUser) {
      throw new AppError('Recipient not found in your home', 404);
    }

    // Cannot transfer to yourself
    if (fromUserId === input.toUserId) {
      throw new AppError('Cannot transfer to yourself', 400);
    }

    // Get fromUser for title
    const fromUser = await User.findById(fromUserObjectId);
    if (!fromUser) {
      throw new AppError('User not found', 404);
    }

    // Find or create a "Transfer" category
    let transferCategory = await Category.findOne({
      homeId: homeObjectId,
      name: 'Transfer',
    });

    if (!transferCategory) {
      transferCategory = await Category.create({
        name: 'Transfer',
        icon: '💸',
        color: '#6366F1',
        type: 'BOTH',
        isDefault: true,
        homeId: homeObjectId,
      });
    }

    const title = input.title || `Transfer`;

    // Create single transfer transaction
    // This will be shown to both users - sender sees it as expense, receiver sees it as income
    const transaction = await Transaction.create({
      type: 'TRANSFER',
      title,
      amount: input.amount,
      date: input.date,
      categoryId: transferCategory._id,
      createdById: fromUserObjectId,
      homeId: homeObjectId,
      fromUserId: fromUserObjectId,
      toUserId: toUserObjectId,
      isShared: false,
      isRecurring: false,
    });

    return transaction.toJSON();
  }
}

export const transactionService = new TransactionService();
