import { Loan } from '../../models';
import { AppError } from '../../middlewares/error.middleware';
import { CreateLoanInput, UpdateLoanInput } from './loan.schema';
import mongoose from 'mongoose';

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
