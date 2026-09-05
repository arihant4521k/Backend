const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define schemas inline to ensure standalone execution
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
  createdAt: { type: Date, default: Date.now }
});

const TableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  qrSlug: { type: String }, // Provided for alternate route naming
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  createdAt: { type: Date, default: Date.now }
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [{ type: String }],
  imageUrl: { type: String, default: '' },
  availability: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Table = mongoose.models.Table || mongoose.model('Table', TableSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);

const seedDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant-qr';

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Table.deleteMany({}),
      Category.deleteMany({}),
      MenuItem.deleteMany({})
    ]);
    console.log('Existing collections cleared');

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      {
        name: 'Admin Manager',
        email: 'admin@restaurant.com',
        password: defaultPassword,
        role: 'admin'
      },
      {
        name: 'Floor Staff',
        email: 'staff@restaurant.com',
        password: defaultPassword,
        role: 'staff'
      },
      {
        name: 'Regular Customer',
        email: 'customer@example.com',
        password: defaultPassword,
        role: 'customer'
      }
    ]);
    console.log(`Seeded ${users.length} users`);

    // 2. Seed Tables
    const tables = await Table.insertMany([
      { number: 1, slug: 'table-1', qrSlug: 'table-1', status: 'available' },
      { number: 2, slug: 'table-2', qrSlug: 'table-2', status: 'available' },
      { number: 3, slug: 'table-3', qrSlug: 'table-3', status: 'available' },
      { number: 4, slug: 'table-4', qrSlug: 'table-4', status: 'occupied' },
      { number: 5, slug: 'table-5', qrSlug: 'table-5', status: 'available' }
    ]);
    console.log(`Seeded ${tables.length} tables`);

    // 3. Seed Categories
    const categories = await Category.insertMany([
      { name: 'Appetizers', displayOrder: 1 },
      { name: 'Main Course', displayOrder: 2 },
      { name: 'Beverages', displayOrder: 3 },
      { name: 'Desserts', displayOrder: 4 }
    ]);
    console.log(`Seeded ${categories.length} categories`);

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.name] = cat._id;
      return acc;
    }, {});

    // 4. Seed Menu Items
    const menuItems = [
      // Appetizers
      {
        name: 'Truffle Parmesan Fries',
        description: 'Crispy hand-cut fries tossed with white truffle oil and grated parmesan.',
        price: 7.99,
        categoryId: categoryMap['Appetizers'],
        tags: ['vegetarian', 'crispy', 'popular'],
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
        availability: true
      },
      {
        name: 'Crispy Calamari',
        description: 'Tender squid rings served with garlic aioli and fresh lemon wedges.',
        price: 11.50,
        categoryId: categoryMap['Appetizers'],
        tags: ['seafood', 'crispy'],
        imageUrl: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600',
        availability: true
      },
      // Main Course
      {
        name: 'Classic Cheeseburger',
        description: 'Angus beef patty with cheddar cheese, lettuce, tomato, and house special sauce.',
        price: 14.99,
        categoryId: categoryMap['Main Course'],
        tags: ['beef', 'bestseller'],
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
        availability: true
      },
      {
        name: 'Margherita Pizza',
        description: 'San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil.',
        price: 13.50,
        categoryId: categoryMap['Main Course'],
        tags: ['vegetarian', 'italian'],
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600',
        availability: true
      },
      {
        name: 'Grilled Salmon Bowl',
        description: 'Atlantic salmon filet served over brown rice, steamed greens, and teriyaki glaze.',
        price: 18.25,
        categoryId: categoryMap['Main Course'],
        tags: ['healthy', 'seafood'],
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600',
        availability: true
      },
      // Beverages
      {
        name: 'Fresh Mint Lemonade',
        description: 'Freshly squeezed lemon juice, organic mint leaves, and light cane syrup.',
        price: 4.50,
        categoryId: categoryMap['Beverages'],
        tags: ['refreshing', 'cold'],
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
        availability: true
      },
      {
        name: 'Iced Caramel Macchiato',
        description: 'Rich espresso poured over chilled milk, vanilla syrup, and caramel drizzle.',
        price: 5.25,
        categoryId: categoryMap['Beverages'],
        tags: ['coffee', 'cold'],
        imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600',
        availability: true
      },
      // Desserts
      {
        name: 'Warm Chocolate Lava Cake',
        description: 'Molten dark chocolate center served with vanilla bean ice cream.',
        price: 8.50,
        categoryId: categoryMap['Desserts'],
        tags: ['sweet', 'popular'],
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
        availability: true
      }
    ];

    const insertedItems = await MenuItem.insertMany(menuItems);
    console.log(`Seeded ${insertedItems.length} menu items`);

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

seedDatabase();
