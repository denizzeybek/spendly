import mongoose, { Schema, Document } from 'mongoose';
import { CategoryType } from '../types';

export interface ICategoryDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string; // Keep for backward compatibility, will be deprecated
  nameTr: string;
  nameEn: string;
  icon: string;
  color: string;
  type: CategoryType;
  isDefault: boolean;
  homeId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: false, // Deprecated, keeping for backward compatibility
      trim: true,
    },
    nameTr: {
      type: String,
      required: true,
      trim: true,
    },
    nameEn: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['INCOME', 'EXPENSE', 'BOTH'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    homeId: {
      type: Schema.Types.ObjectId,
      ref: 'Home',
      default: null,
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

categorySchema.index({ homeId: 1, name: 1 }, { unique: true });
categorySchema.index({ type: 1 });
categorySchema.index({ isDefault: 1 });

export const Category = mongoose.model<ICategoryDocument>('Category', categorySchema);
