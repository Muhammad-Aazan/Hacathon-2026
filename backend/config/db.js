import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop legacy employeeCode_1 index if it exists in the database
    try {
      const collections = await mongoose.connection.db.listCollections({ name: 'employees' }).toArray();
      if (collections.length > 0) {
        const indexes = await mongoose.connection.collection('employees').indexes();
        const hasLegacyIndex = indexes.some(idx => idx.name === 'employeeCode_1');
        if (hasLegacyIndex) {
          await mongoose.connection.collection('employees').dropIndex('employeeCode_1');
          console.log('✅ Successfully dropped legacy employeeCode_1 index from employees collection');
        }
      }
    } catch (idxErr) {
      // Ignore if index doesn't exist
    }

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
