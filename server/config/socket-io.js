const { Server } = require("socket.io");
const Message = require("../models/Message");

let io = null;

function initSocket(server) {
	if (io) return io;

	io = new Server(server, {
		cors: {
			origin: process.env.CLIENT_URL || "http://localhost:5173",
			methods: ["GET", "POST"],
			allowedHeaders: ["Access-Control-Allow-Origin"],
			credentials: true,
		},
	});

	io.on("connection", (socket) => {
		console.log("A user connected:", socket.id);

		socket.on("join_room", async (room, ack) => {
			try {
				socket.join(room);
				const messages = await Message.find({ room })
					.sort({ timestamp: 1 })
					.limit(50);
				socket.emit("room_messages", { room, messages });
				if (ack) ack({ status: "ok" });
			} catch (err) {
				console.error("Error loading room messages:", err);
				if (ack) ack({ status: "error" });
			}
		});

		socket.on("chat_message", async (data) => {
			try {
				const { username, message, room = "global" } = data;
				const newMessage = new Message({ username, message, room });
				await newMessage.save();
				io.to(room).emit("chat_message", {
					_id: newMessage._id,
					username,
					message,
					room,
					timestamp: newMessage.timestamp,
				});
			} catch (err) {
				console.error("Error saving message:", err);
			}
		});

		socket.on("typing", ({ room, username }) => {
			if (room) socket.to(room).emit("typing", { username });
		});
		socket.on("stop_typing", ({ room, username }) => {
			if (room) socket.to(room).emit("stop_typing", { username });
		});

		socket.on("notification", (payload) => {
			if (payload && payload.room)
				io.to(payload.room).emit("notification", payload);
			else io.emit("notification", payload);
		});

		socket.on("disconnect", () => {
			console.log("A user disconnected:", socket.id);
		});
	});

	return io;
}

function getIO() {
	if (!io)
		throw new Error(
			"Socket.io not initialized. Call initSocket(server) first.",
		);
	return io;
}

module.exports = { initSocket, getIO };
