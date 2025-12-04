import mongoose, { Schema, Document } from 'mongoose';

export interface ILoanDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  userId: mongoose.Types.ObjectId;
  totalAmount: number; // Total loan amount (principal + interest)
  principalAmount: number; // Original borrowed amount
  monthlyPayment: number; // Monthly installment amount
  totalInstallments: number; // Total number of installments
  paidInstallments: number; // Number of paid installments
  startDate: Date; // When loan started (first payment month)
  interestRate?: number; // Annual interest rate (optional)
  notes?: string; // Optional notes
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoanDocument>(
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
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    principalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    monthlyPayment: {
      type: Number,
      required: true,
      min: 0,
    },
    totalInstallments: {
      type: Number,
      required: true,
      min: 1,
    },
    paidInstallments: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    interestRate: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
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

// Index for faster queries by userId
loanSchema.index({ userId: 1 });

// Virtual for remaining installments
loanSchema.virtual('remainingInstallments').get(function () {
  return this.totalInstallments - this.paidInstallments;
});

// Virtual for remaining amount
loanSchema.virtual('remainingAmount').get(function () {
  return this.monthlyPayment * (this.totalInstallments - this.paidInstallments);
});

// Virtual for paid amount
loanSchema.virtual('paidAmount').get(function () {
  return this.monthlyPayment * this.paidInstallments;
});

// Virtual for progress percentage
loanSchema.virtual('progressPercentage').get(function () {
  return Math.round((this.paidInstallments / this.totalInstallments) * 100);
});

// Virtual for end date
loanSchema.virtual('endDate').get(function () {
  const endDate = new Date(this.startDate);
  endDate.setMonth(endDate.getMonth() + this.totalInstallments - 1);
  return endDate;
});

// Virtual for next payment date
loanSchema.virtual('nextPaymentDate').get(function () {
  if (this.paidInstallments >= this.totalInstallments) {
    return null;
  }
  const nextDate = new Date(this.startDate);
  nextDate.setMonth(nextDate.getMonth() + this.paidInstallments);
  return nextDate;
});

// Ensure virtuals are included in JSON
loanSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = (ret._id as { toString(): string }).toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Loan = mongoose.model<ILoanDocument>('Loan', loanSchema);
