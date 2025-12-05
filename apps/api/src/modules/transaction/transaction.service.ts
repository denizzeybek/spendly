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

    // If this is a transfer, also delete the linked transaction
    if (transaction.type === 'TRANSFER' && transaction.linkedTransactionId) {
      await Transaction.findByIdAndDelete(transaction.linkedTransactionId);
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

    // Create outgoing transaction (from sender's perspective)
    const outgoingTransaction = await Transaction.create({
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

    // Create incoming transaction (from receiver's perspective)
    const incomingTransaction = await Transaction.create({
      type: 'TRANSFER',
      title,
      amount: input.amount,
      date: input.date,
      categoryId: transferCategory._id,
      createdById: toUserObjectId,
      homeId: homeObjectId,
      fromUserId: fromUserObjectId,
      toUserId: toUserObjectId,
      linkedTransactionId: outgoingTransaction._id,
      isShared: false,
      isRecurring: false,
    });

    // Link the outgoing transaction to incoming
    await Transaction.findByIdAndUpdate(outgoingTransaction._id, {
      linkedTransactionId: incomingTransaction._id,
    });

    return outgoingTransaction.toJSON();
  }
}

export const transactionService = new TransactionService();
