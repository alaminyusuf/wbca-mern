// src/socket.jsx
import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Replace with your backend URL
export const socket = io(URL, {
	autoConnect: true,
});

// Helper for joining rooms
export function joinRoom(room, cb) {
	socket.emit("join_room", room, cb);
}

export function sendMessage({ room = "global", username, message }) {
	socket.emit("chat_message", { room, username, message });
}

export function startTyping(room, username) {
	socket.emit("typing", { room, username });
}

export function stopTyping(room, username) {
	socket.emit("stop_typing", { room, username });
}

export function sendNotification(payload) {
	socket.emit("notification", payload);
}
