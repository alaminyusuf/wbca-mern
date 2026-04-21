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

// Initialize socket.io and redis adapter from config
const io = initSocket(server);
setupRedis().catch((err) => console.error("Redis setup failed:", err));

server.on("error", (err) => {
	console.error("❌ Server Error:", err);
});

server.listen(PORT, (err) => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
