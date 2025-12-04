import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Category name mapping from old translation keys to new values
const CATEGORY_NAME_MAP: Record<string, { nameTr: string; nameEn: string }> = {
  // Bills
  'categories.bills.rent': { nameTr: 'Kira', nameEn: 'Rent' },
  'categories.bills.dues': { nameTr: 'Aidat', nameEn: 'Dues' },
  'categories.bills.electricity': { nameTr: 'Elektrik', nameEn: 'Electricity' },
  'categories.bills.water': { nameTr: 'Su', nameEn: 'Water' },
  'categories.bills.gas': { nameTr: 'Doğalgaz', nameEn: 'Gas' },
  'categories.bills.internet': { nameTr: 'İnternet', nameEn: 'Internet' },

  // Transport
  'categories.transport.motorcycle_fuel': { nameTr: 'Motor Yakıt', nameEn: 'Motorcycle Fuel' },
  'categories.transport.car_fuel': { nameTr: 'Araba Yakıt', nameEn: 'Car Fuel' },

  // Subscriptions
  'categories.subscriptions.netflix': { nameTr: 'Netflix', nameEn: 'Netflix' },
  'categories.subscriptions.prime': { nameTr: 'Prime Video', nameEn: 'Prime Video' },
  'categories.subscriptions.hbo': { nameTr: 'HBO Max', nameEn: 'HBO Max' },
  'categories.subscriptions.gym': { nameTr: 'Spor Salonu', nameEn: 'Gym' },

  // Other Expense
  'categories.groceries': { nameTr: 'Market', nameEn: 'Groceries' },
  'categories.health': { nameTr: 'Sağlık', nameEn: 'Health' },
  'categories.entertainment': { nameTr: 'Eğlence', nameEn: 'Entertainment' },
  'categories.loan_payment': { nameTr: 'Kredi Taksiti', nameEn: 'Loan Payment' },
  'categories.other_expense': { nameTr: 'Diğer Gider', nameEn: 'Other Expense' },

  // Income
  'categories.salary': { nameTr: 'Maaş', nameEn: 'Salary' },
  'categories.side_income': { nameTr: 'Ek Gelir', nameEn: 'Side Income' },
  'categories.other_income': { nameTr: 'Diğer Gelir', nameEn: 'Other Income' },
};

async function migrateCategories() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const categoriesCollection = db.collection('categories');

    // Get all categories that need migration (have old name format but no nameTr/nameEn)
    const categoriesToMigrate = await categoriesCollection.find({
      $or: [
        { nameTr: { $exists: false } },
        { nameEn: { $exists: false } },
      ],
    }).toArray();

    console.log(`Found ${categoriesToMigrate.length} categories to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const category of categoriesToMigrate) {
      const oldName = category.name as string;
      const mapping = CATEGORY_NAME_MAP[oldName];

      if (mapping) {
        await categoriesCollection.updateOne(
          { _id: category._id },
          {
            $set: {
              nameTr: mapping.nameTr,
              nameEn: mapping.nameEn,
            },
          }
        );
        console.log(`Migrated: ${oldName} -> TR: ${mapping.nameTr}, EN: ${mapping.nameEn}`);
        migratedCount++;
      } else {
        // For custom categories without mapping, use the old name for both
        // This handles user-created categories
        const displayName = oldName.startsWith('categories.') ? oldName : oldName;
        await categoriesCollection.updateOne(
          { _id: category._id },
          {
            $set: {
              nameTr: category.nameTr || displayName,
              nameEn: category.nameEn || displayName,
            },
          }
        );
        console.log(`Skipped (custom category): ${oldName} - used as-is`);
        skippedCount++;
      }
    }

    console.log('\nMigration completed!');
    console.log(`Migrated: ${migratedCount} categories`);
    console.log(`Skipped (custom): ${skippedCount} categories`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateCategories();
