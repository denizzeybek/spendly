import { User, Transaction, CreditCard } from '../../models';
import { AppError } from '../../middlewares/error.middleware';
import mongoose from 'mongoose';

export class UserService {
  async getById(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const creditCard = await CreditCard.findOne({ userId: user._id });

    return {
      ...user.toJSON(),
      creditCard: creditCard?.toJSON() || null,
    };
  }

  async update(userId: string, input: { name?: string }) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: input },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.toJSON();
  }

  async getSummary(userId: string, homeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const homeObjectId = new mongoose.Types.ObjectId(homeId);

    // Get user's credit card
    const creditCard = await CreditCard.findOne({ userId: userObjectId });
    const creditCardId = creditCard?._id;

    // Get all home users count for shared expense calculation
    const homeUsersCount = await User.countDocuments({ homeId: homeObjectId });

    // User's income
    const [incomeAgg] = await Transaction.aggregate([
      {
        $match: {
          createdById: userObjectId,
          type: 'INCOME',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Expenses assigned to user's credit card
    const [creditCardExpenseAgg] = await Transaction.aggregate([
      {
        $match: {
          assignedCardId: creditCardId,
          type: 'EXPENSE',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Shared expenses (user's portion)
    const [sharedExpenseAgg] = await Transaction.aggregate([
      {
        $match: {
          homeId: homeObjectId,
          type: 'EXPENSE',
          isShared: true,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Personal expenses on user's card (non-shared)
    const [personalExpenseAgg] = await Transaction.aggregate([
      {
        $match: {
          assignedCardId: creditCardId,
          type: 'EXPENSE',
          isShared: false,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalIncome = incomeAgg?.total || 0;
    const creditCardDebt = creditCardExpenseAgg?.total || 0;
    const totalSharedExpense = sharedExpenseAgg?.total || 0;
    const sharedExpenseShare = homeUsersCount > 0 ? totalSharedExpense / homeUsersCount : 0;
    const personalExpense = personalExpenseAgg?.total || 0;

    return {
      userId,
      month,
      year,
      totalIncome,
      creditCardDebt,
      sharedExpense: Math.round(sharedExpenseShare * 100) / 100,
      personalExpense,
      totalExpense: Math.round((sharedExpenseShare + personalExpense) * 100) / 100,
      balance: Math.round((totalIncome - sharedExpenseShare - personalExpense) * 100) / 100,
    };
  }
}

export const userService = new UserService();
