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

  async getUserSummaries(homeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const homeObjectId = new mongoose.Types.ObjectId(homeId);

    // Get all users in home
    const users = await User.find({ homeId: homeObjectId });

    // Get summaries for each user
    const userSummaries = await Promise.all(
      users.map(async (user) => {
        const userId = user._id;

        // Get user's credit cards
        const userCreditCards = await CreditCard.find({ userId });
        const cardIds = userCreditCards.map((c) => c._id);

        // Aggregate transactions for this user
        const [incomeAgg, personalExpenseAgg, mySharedExpenseAgg, allSharedExpenseAgg, creditCardAgg] = await Promise.all([
          // Total income created by this user (excluding transfers)
          Transaction.aggregate([
            {
              $match: {
                homeId: homeObjectId,
                createdById: userId,
                type: 'INCOME',
                date: { $gte: startDate, $lte: endDate },
              },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
          // Personal expenses (non-shared) created by this user
          Transaction.aggregate([
            {
              $match: {
                homeId: homeObjectId,
                createdById: userId,
                type: 'EXPENSE',
                isShared: { $ne: true },
                date: { $gte: startDate, $lte: endDate },
              },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
          // Shared expenses created by this user
          Transaction.aggregate([
            {
              $match: {
                homeId: homeObjectId,
                createdById: userId,
                type: 'EXPENSE',
                isShared: true,
                date: { $gte: startDate, $lte: endDate },
              },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
          // ALL shared expenses in the home (to calculate user's share)
          Transaction.aggregate([
            {
              $match: {
                homeId: homeObjectId,
                type: 'EXPENSE',
                isShared: true,
                date: { $gte: startDate, $lte: endDate },
              },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
          // Credit card debt (expenses assigned to user's cards)
          cardIds.length > 0
            ? Transaction.aggregate([
                {
                  $match: {
                    homeId: homeObjectId,
                    assignedCardId: { $in: cardIds },
                    type: 'EXPENSE',
                    date: { $gte: startDate, $lte: endDate },
                  },
                },
                { $group: { _id: null, total: { $sum: '$amount' } } },
              ])
            : [{ total: 0 }],
        ]);

        const totalIncome = incomeAgg[0]?.total || 0;
        const personalExpense = personalExpenseAgg[0]?.total || 0;
        const mySharedExpense = mySharedExpenseAgg[0]?.total || 0;
        const allSharedExpense = allSharedExpenseAgg[0]?.total || 0;
        const creditCardDebt = creditCardAgg[0]?.total || 0;

        // User's share of ALL shared expenses (divided by number of users in home)
        const userCount = users.length || 1;
        const sharedExpenseShare = allSharedExpense / userCount;

        // Total expense for this user = personal + their share of shared
        const totalExpense = personalExpense + sharedExpenseShare;

        return {
          userId: user._id.toString(),
          userName: user.name,
          userEmail: user.email,
          totalIncome,
          totalExpense,
          personalExpense,
          sharedExpenseShare,
          mySharedExpense, // What this user entered as shared
          creditCardDebt,
          balance: totalIncome - totalExpense,
        };
      })
    );

    // Calculate total shared expenses for the home
    const totalSharedExpense = userSummaries.reduce((sum, u) => sum + (u.mySharedExpense || 0), 0);

    return {
      month,
      year,
      users: userSummaries,
      totalSharedExpense,
    };
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
            categoryNameTr: '$category.nameTr',
            categoryNameEn: '$category.nameEn',
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
