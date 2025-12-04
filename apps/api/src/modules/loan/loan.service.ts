import { Loan, User, Category, Transaction } from '../../models';
import { AppError } from '../../middlewares/error.middleware';
import { CreateLoanInput, UpdateLoanInput } from './loan.schema';
import mongoose from 'mongoose';

const LOAN_PAYMENT_CATEGORY = {
  nameTr: 'Kredi Taksiti',
  nameEn: 'Loan Payment',
};

export class LoanService {
  async list(userId: string) {
    const loans = await Loan.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });
    return loans.map((l) => l.toJSON());
  }

  async getById(id: string, userId: string) {
    const loan = await Loan.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    return loan.toJSON();
  }

  async create(input: CreateLoanInput, userId: string) {
    // Check for duplicate name for user
    const existing = await Loan.findOne({
      name: input.name,
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (existing) {
      throw new AppError('Loan with this name already exists', 409);
    }

    const loan = await Loan.create({
      ...input,
      userId: new mongoose.Types.ObjectId(userId),
    });

    return loan.toJSON();
  }

  async update(id: string, input: UpdateLoanInput, userId: string) {
    const loan = await Loan.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    // Check for duplicate name if name is being updated
    if (input.name && input.name !== loan.name) {
      const existing = await Loan.findOne({
        name: input.name,
        userId: new mongoose.Types.ObjectId(userId),
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError('Loan with this name already exists', 409);
      }
    }

    // Validate paidInstallments doesn't exceed totalInstallments
    const totalInstallments = input.totalInstallments ?? loan.totalInstallments;
    const paidInstallments = input.paidInstallments ?? loan.paidInstallments;
    if (paidInstallments > totalInstallments) {
      throw new AppError('Paid installments cannot exceed total installments', 400);
    }

    const updated = await Loan.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true }
    );

    return updated!.toJSON();
  }

  async payInstallment(id: string, count: number, userId: string) {
    const loan = await Loan.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    const newPaidInstallments = loan.paidInstallments + count;
    if (newPaidInstallments > loan.totalInstallments) {
      throw new AppError('Cannot pay more installments than remaining', 400);
    }

    // Get user to find homeId
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Find or create loan payment category for this home
    let loanPaymentCategory = await Category.findOne({
      nameTr: LOAN_PAYMENT_CATEGORY.nameTr,
      homeId: user.homeId,
    });

    // If category doesn't exist for this home, create it
    if (!loanPaymentCategory) {
      loanPaymentCategory = await Category.create({
        nameTr: LOAN_PAYMENT_CATEGORY.nameTr,
        nameEn: LOAN_PAYMENT_CATEGORY.nameEn,
        icon: 'bank-transfer',
        color: '#5C6BC0',
        type: 'EXPENSE',
        isDefault: true,
        homeId: user.homeId,
      });
    }

    // Create transaction(s) for each installment paid
    const transactionAmount = loan.monthlyPayment * count;
    await Transaction.create({
      type: 'EXPENSE',
      title: `${loan.name} - Taksit ${loan.paidInstallments + 1}${count > 1 ? `-${loan.paidInstallments + count}` : ''}`,
      amount: transactionAmount,
      date: new Date(),
      categoryId: loanPaymentCategory._id,
      isShared: false,
      isRecurring: false,
      createdById: new mongoose.Types.ObjectId(userId),
      homeId: user.homeId,
    });

    const updated = await Loan.findByIdAndUpdate(
      id,
      { $set: { paidInstallments: newPaidInstallments } },
      { new: true }
    );

    return updated!.toJSON();
  }

  async delete(id: string, userId: string) {
    const loan = await Loan.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    await Loan.findByIdAndDelete(id);
    return { id };
  }
}

export const loanService = new LoanService();
