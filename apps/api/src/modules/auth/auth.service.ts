import { User, Home, CreditCard, Category, IHomeDocument } from '../../models';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateTokens, verifyRefreshToken } from '../../utils/jwt';
import { generateHomeCode } from '../../utils/helpers';
import { ALL_DEFAULT_CATEGORIES } from '../../constants';
import { AppError } from '../../middlewares/error.middleware';
import { RegisterInput, LoginInput } from './auth.schema';
import mongoose from 'mongoose';

export class AuthService {
  async register(input: RegisterInput) {
    const { email, password, name, homeName, homeCode } = input;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await hashPassword(password);

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let home: IHomeDocument | null = null;

      if (homeCode) {
        // Join existing home
        home = await Home.findOne({ code: homeCode.toUpperCase() }).session(session);
        if (!home) {
          throw new AppError('Home not found with this code', 404);
        }
      } else if (homeName) {
        // Create new home
        let code = generateHomeCode();
        // Ensure unique code
        while (await Home.findOne({ code }).session(session)) {
          code = generateHomeCode();
        }

        // Create home with a temporary ownerId
        const tempOwnerId = new mongoose.Types.ObjectId();
        [home] = await Home.create([{
          code,
          name: homeName,
          currency: 'TRY',
          ownerId: tempOwnerId,
        }], { session });

        // Seed default categories for this home
        const defaultCategories = ALL_DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          isDefault: true,
          homeId: home!._id,
        }));
        await Category.insertMany(defaultCategories, { session });
      } else {
        throw new AppError('Either homeName or homeCode is required', 400);
      }

      // At this point, home is guaranteed to be non-null
      if (!home) {
        throw new AppError('Home creation failed', 500);
      }

      // Create user
      const [user] = await User.create([{
        email,
        password: hashedPassword,
        name,
        homeId: home._id,
      }], { session });

      // Create credit card for user
      await CreditCard.create([{
        name: `${name} Kredi Kartı`,
        userId: user._id,
      }], { session });

      // If new home, update owner
      if (homeName) {
        await Home.findByIdAndUpdate(home._id, { ownerId: user._id }, { session });
      }

      await session.commitTransaction();

      // Generate tokens
      const tokens = generateTokens({
        userId: user._id.toString(),
        homeId: home._id.toString(),
      });

      return {
        user: user.toJSON(),
        home: home.toJSON(),
        ...tokens,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async login(input: LoginInput) {
    const { email, password } = input;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Compare password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Get home
    const home = await Home.findById(user.homeId);
    if (!home) {
      throw new AppError('Home not found', 404);
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      homeId: home._id.toString(),
    });

    return {
      user: user.toJSON(),
      home: home.toJSON(),
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    // Verify user still exists
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const home = await Home.findById(user.homeId);
    if (!home) {
      throw new AppError('Home not found', 404);
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      homeId: home._id.toString(),
    });

    return {
      user: user.toJSON(),
      home: home.toJSON(),
      ...tokens,
    };
  }

  async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const home = await Home.findById(user.homeId);
    if (!home) {
      throw new AppError('Home not found', 404);
    }

    const creditCard = await CreditCard.findOne({ userId: user._id });

    return {
      user: user.toJSON(),
      home: home.toJSON(),
      creditCard: creditCard?.toJSON() || null,
    };
  }
}

export const authService = new AuthService();
