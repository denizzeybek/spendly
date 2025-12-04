import mongoose, { Schema, Document } from 'mongoose';

export interface IHomeDocument extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  name: string;
  currency: string;
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const homeSchema = new Schema<IHomeDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 6,
      maxlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'TRY',
      enum: ['TRY', 'USD', 'EUR'],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// code index is created by unique: true
homeSchema.index({ ownerId: 1 });

export const Home = mongoose.model<IHomeDocument>('Home', homeSchema);
