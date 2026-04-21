const mongoose = require("mongoose");
const DB_URI = process.env.MONGO_URI;

// Connect to MongoDB

const connectDB = async () => {
	try {
		await mongoose
			.connect(DB_URI, {})
			.then(() => {
				console.log("Connected to MongoDB");
			})
			.catch((err) => {
				console.error("MongoDB connection error:", err);
			});
	} catch (e) {
		console.error(e);
	}
};
module.exports = connectDB;
