const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket-io");
const { apiLimiter } = require("./middleware/rate-limiter");
const apiRoutes = require("./routes");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect to Database
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

// Health Check Endpoint (before rate limiting to allow monitoring)
app.get("/api/health", (req, res) => {
	res.status(200).json({
		status: "UP",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);
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
	process.exit(1);
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
	console.log(`\n释放 ${signal} signal received. Shutting down gracefully...`);
	server.close(() => {
		console.log("HTTP server closed.");
		mongoose.connection.close(false).then(() => {
			console.log("MongoDB connection closed.");
			process.exit(0);
		});
	});

	// Force close after 10s
	setTimeout(() => {
		console.error("Could not close connections in time, forcefully shutting down");
		process.exit(1);
	}, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

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
