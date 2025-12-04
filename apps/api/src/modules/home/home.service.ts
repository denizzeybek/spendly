import { Home, User, Transaction, CreditCard } from '../../models';
import { AppError } from '../../middlewares/error.middleware';
import { UpdateHomeInput } from './home.schema';
import mongoose from 'mongoose';

export class HomeService {
  async getById(homeId: string, userId: string) {
    const home = await Home.findById(homeId);
    if (!home) {
      throw new AppError('Home not found', 404);
    }

    // Verify user belongs to this home
    const user = await User.findOne({ _id: userId, homeId: home._id });
    if (!user) {
      throw new AppError('Access denied', 403);
    }

    return home.toJSON();
  }

  async update(homeId: string, userId: string, input: UpdateHomeInput) {
    const home = await Home.findById(homeId);
    if (!home) {
      throw new AppError('Home not found', 404);
    }

    // Only owner can update
    if (home.ownerId.toString() !== userId) {
      throw new AppError('Only home owner can update', 403);
    }

    const updated = await Home.findByIdAndUpdate(
      homeId,
      { $set: input },
      { new: true }
    );

    return updated!.toJSON();
  }

  async getUsers(homeId: string) {
    const users = await User.find({ homeId: new mongoose.Types.ObjectId(homeId) });

    // Get credit cards for each user
    const usersWithCards = await Promise.all(
      users.map(async (user) => {
        const creditCard = await CreditCard.findOne({ userId: user._id });
        return {
          ...user.toJSON(),
          creditCard: creditCard?.toJSON() || null,
        };
      })
    );

    return usersWithCards;
  }

  async getSummary(homeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const homeObjectId = new mongoose.Types.ObjectId(homeId);

    // Get aggregated data
    const [incomeAgg, expenseAgg, byCategoryAgg] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            homeId: homeObjectId,
            type: 'INCOME',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            homeId: homeObjectId,
            type: 'EXPENSE',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            homeId: homeObjectId,
            type: 'EXPENSE',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$categoryId',
            total: { $sum: '$amount' },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $project: {
            categoryId: '$_id',
            categoryName: '$category.name',
            categoryIcon: '$category.icon',
            categoryColor: '$category.color',
            total: 1,
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpense = expenseAgg[0]?.total || 0;

    // Calculate percentages
    const byCategory = byCategoryAgg.map((cat) => ({
      ...cat,
      percentage: totalExpense > 0 ? Math.round((cat.total / totalExpense) * 100 * 100) / 100 : 0,
    }));

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory,
    };
  }
}

export const homeService = new HomeService();
