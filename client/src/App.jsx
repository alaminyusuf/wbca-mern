import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";
import "./App.css";

import {
	socket,
	joinRoom,
	sendMessage,
	startTyping,
	stopTyping,
} from "./socket.jsx";

function App() {
	const [rooms, setRooms] = useState(["global"]);
	const [currentRoom, setCurrentRoom] = useState("global");
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState("");
	const [username, setUsername] = useState("");
	const [typingUsers, setTypingUsers] = useState({});
	const navigate = useNavigate();

	function parseJwt(token) {
		if (!token) {
			throw new Error("Token not Found");
		}
		try {
			const base64Url = token.split(".")[1];
			const base64 = base64Url.replace("-", "+").replace("_", "/");
			return JSON.parse(window.atob(base64));
		} catch (error) {
			console.error("Failed to parse JWT:", error);
			throw error;
		}
	}

	useEffect(() => {
		// Check auth
		const token = Cookies.get("wbca");
		if (!token) {
			navigate("/login");
			return;
		}
		try {
			const formatted = parseJwt(token);
			setUsername(formatted.username);
		} catch (err) {
			Cookies.remove("wbca");
			navigate("/login");
			return;
		}

		// Listen for room messages and chat updates
		socket.on("room_messages", ({ room, messages }) => {
			if (room === currentRoom) setMessages(messages);
		});

		socket.on("chat_message", (data) => {
			if (data.room === currentRoom) setMessages((m) => [...m, data]);
		});

		socket.on("typing", ({ username: user }) => {
			setTypingUsers((t) => ({ ...t, [user]: true }));
			// clear after 3s
			setTimeout(
				() =>
					setTypingUsers((t) => {
						const copy = { ...t };
						delete copy[user];
						return copy;
					}),
				3000,
			);
		});

		socket.on("stop_typing", ({ username: user }) => {
			setTypingUsers((t) => {
				const copy = { ...t };
				delete copy[user];
				return copy;
			});
		});

		// Join default room on mount
		joinRoom(currentRoom, (res) => {
			// server sends room_messages; nothing else needed here
		});

		return () => {
			socket.off("room_messages");
			socket.off("chat_message");
			socket.off("typing");
			socket.off("stop_typing");
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentRoom, navigate]);

	function handleCreateRoom(e) {
		e.preventDefault();
		const name = e.target.roomName.value.trim();
		if (!name) return;
		if (!rooms.includes(name)) setRooms((r) => [...r, name]);
		setCurrentRoom(name);
		joinRoom(name);
		e.target.reset();
	}

	function handleSelectRoom(name) {
		setCurrentRoom(name);
		setMessages([]);
		joinRoom(name);
	}

	function handleSubmit(e) {
		e.preventDefault();
		if (!message.trim()) return;
		sendMessage({ room: currentRoom, username, message });
		setMessage("");
	}

	function handleKeyDown() {
		startTyping(currentRoom, username);
	}

	function handleBlur() {
		stopTyping(currentRoom, username);
	}

	return (
		<div className="chat-layout flex h-screen">
			<aside className="w-64 bg-gray-100 border-r p-4">
				<h3 className="font-bold mb-2">Rooms</h3>
				<ul>
					{rooms.map((r) => (
						<li key={r}>
							<button
								onClick={() => handleSelectRoom(r)}
								className={`w-full text-left px-2 py-1 rounded ${r === currentRoom ? "bg-red-600 text-white" : "hover:bg-gray-200"}`}
							>
								{r}
							</button>
						</li>
					))}
				</ul>
				<form onSubmit={handleCreateRoom} className="mt-4">
					<input
						name="roomName"
						placeholder="New room"
						className="w-full px-2 py-1 border rounded mb-2"
					/>
					<button className="w-full px-2 py-1 bg-red-600 text-white rounded">
						Create / Join
					</button>
				</form>
			</aside>

			<main className="flex-1 flex flex-col">
				<header className="p-4 border-b">
					<h2 className="font-bold">Room: {currentRoom}</h2>
				</header>

				<div className="flex-1 overflow-y-auto p-4" id="messages">
					{messages.map((msg, index) => (
						<div key={msg._id || index} className="mb-4">
							<div className="max-w-lg px-4 py-2 rounded-lg shadow-md bg-red-600 text-white">
								<p className="font-bold text-xs mb-1">{msg.username}</p>
								<p className="text-sm">{msg.message}</p>
								<p className="text-xs text-gray-300 text-right">
									{new Date(msg.timestamp).toLocaleTimeString()}
								</p>
							</div>
						</div>
					))}
				</div>

				<div className="p-4 border-t">
					<div className="mb-2 text-xs text-gray-600">
						{Object.keys(typingUsers).length > 0 && (
							<span>
								{Object.keys(typingUsers).join(", ")} typing...
							</span>
						)}
					</div>
					<form onSubmit={handleSubmit} className="flex items-center">
						<input
							type="text"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyDown={handleKeyDown}
							onBlur={handleBlur}
							placeholder="Type your message..."
							className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
						/>
						<button
							type="submit"
							className="ml-3 px-6 py-2 bg-red-600 text-white rounded-full"
						>
							Send
						</button>
					</form>
				</div>
			</main>
		</div>
	);
}

export default App;
