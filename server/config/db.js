const mongoose = require("mongoose");
const DB_URI = process.env.MONGO_URI;

const connectDB = async () => {
	try {
		await mongoose.connect(DB_URI);
		console.log("✅ Connected to MongoDB");
	} catch (err) {
		console.error("❌ MongoDB connection error:", err.message);
		// In some cases, you might want to exit if the DB is critical
		// process.exit(1);
	}
};

module.exports = connectDB;
