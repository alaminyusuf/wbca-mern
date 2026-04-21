const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const { getIO } = require("./socket-io");
const REDIS_URL = process.env.REDIS_URL;

// Setup Redis adapter for Socket.IO (pub/sub across processes)
async function setupRedis() {
	try {
		const pubClient = createClient({ url: REDIS_URL });
		const subClient = pubClient.duplicate();
		await pubClient.connect();
		await subClient.connect();
		const io = getIO();
		io.adapter(createAdapter(pubClient, subClient));
		console.log("Redis adapter configured");
	} catch (err) {
		console.error("Error setting up Redis adapter:", err);
	}
}

module.exports = setupRedis;
