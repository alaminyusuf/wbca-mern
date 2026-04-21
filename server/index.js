const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket-io");
const setupRedis = require("./config/redis");
const apiRoutes = require("./routes");

dotenv.config();

const app = express();
const server = http.createServer(app);

connectDB();

const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:5173",
		credentials: true,
		methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", apiRoutes);

// 404 Handler
app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
	console.error("🔥 Global Error Handler:", err);
	const statusCode = err.statusCode || 500;
	res.status(statusCode).json({
		error:
			process.env.NODE_ENV === "production"
				? "Internal server error"
				: err.message,
	});
});

// Initialize socket.io and redis adapter from config
const io = initSocket(server);
setupRedis().catch((err) => console.error("Redis setup failed:", err));

// Global Process Error Listeners
process.on("unhandledRejection", (reason, promise) => {
	console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
	// In production, you might want to gracefully shutdown
});

process.on("uncaughtException", (err) => {
	console.error("❌ Uncaught Exception:", err);
	// Exit the process as it's in an unclean state
	process.exit(1);
});

server.on("error", (err) => {
	console.error("❌ Server Error:", err);
});

server.listen(PORT, (err) => {
	if (err) {
		console.error("Server failed to start:", err);
		return;
	}
	console.log(`Server is running on http://localhost:${PORT}`);
});
