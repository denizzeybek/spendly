import mongoose, { Schema, Document } from 'mongoose';
import { TransactionType } from '../types';

export interface ITransactionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  type: TransactionType;
  title: string;
  amount: number;
  date: Date;
  categoryId: mongoose.Types.ObjectId;
  assignedCardId?: mongoose.Types.ObjectId;
  isShared: boolean;
  isRecurring: boolean;
  recurringDay?: number;
  createdById: mongoose.Types.ObjectId;
  homeId: mongoose.Types.ObjectId;
  // Transfer specific fields
  fromUserId?: mongoose.Types.ObjectId;
  toUserId?: mongoose.Types.ObjectId;
  linkedTransactionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransactionDocument>(
  {
    type: {
      type: String,
      required: true,
      enum: ['INCOME', 'EXPENSE', 'TRANSFER'],
    },
    title: {
      type: String,
      required: false,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    assignedCardId: {
      type: Schema.Types.ObjectId,
      ref: 'CreditCard',
      default: null,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDay: {
      type: Number,
      min: 1,
      max: 31,
      default: null,
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    homeId: {
      type: Schema.Types.ObjectId,
      ref: 'Home',
      required: true,
    },
    // Transfer specific fields
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    linkedTransactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

transactionSchema.index({ homeId: 1, date: -1 });
transactionSchema.index({ homeId: 1, type: 1 });
transactionSchema.index({ homeId: 1, categoryId: 1 });
transactionSchema.index({ createdById: 1 });
transactionSchema.index({ assignedCardId: 1 });

export const Transaction = mongoose.model<ITransactionDocument>('Transaction', transactionSchema);
