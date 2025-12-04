import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditCardDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  userId: mongoose.Types.ObjectId;
  billingDate: Date; // Statement/billing date
  createdAt: Date;
}

// Helper to get first day of current month
const getFirstDayOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const creditCardSchema = new Schema<ICreditCardDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    billingDate: {
      type: Date,
      required: true,
      default: getFirstDayOfMonth,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

// Index for faster queries by userId
creditCardSchema.index({ userId: 1 });

export const CreditCard = mongoose.model<ICreditCardDocument>('CreditCard', creditCardSchema);
