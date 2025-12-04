import { CreditCard } from '../../models';
import { AppError } from '../../middlewares/error.middleware';
import { CreateCreditCardInput, UpdateCreditCardInput } from './credit-card.schema';
import mongoose from 'mongoose';

export class CreditCardService {
  async list(userId: string) {
    const creditCards = await CreditCard.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });
    return creditCards.map((c) => c.toJSON());
  }

  async create(input: CreateCreditCardInput, userId: string) {
    // Check for duplicate name for user
    const existing = await CreditCard.findOne({
      name: input.name,
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (existing) {
      throw new AppError('Credit card with this name already exists', 409);
    }

    const creditCard = await CreditCard.create({
      ...input,
      userId: new mongoose.Types.ObjectId(userId),
    });

    return creditCard.toJSON();
  }

  async update(id: string, input: UpdateCreditCardInput, userId: string) {
    const creditCard = await CreditCard.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!creditCard) {
      throw new AppError('Credit card not found', 404);
    }

    // Check for duplicate name if name is being updated
    if (input.name && input.name !== creditCard.name) {
      const existing = await CreditCard.findOne({
        name: input.name,
        userId: new mongoose.Types.ObjectId(userId),
        _id: { $ne: id },
      });
      if (existing) {
        throw new AppError('Credit card with this name already exists', 409);
      }
    }

    const updated = await CreditCard.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true }
    );

    return updated!.toJSON();
  }

  async delete(id: string, userId: string) {
    const creditCard = await CreditCard.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!creditCard) {
      throw new AppError('Credit card not found', 404);
    }

    await CreditCard.findByIdAndDelete(id);
    return { id };
  }
}

export const creditCardService = new CreditCardService();
