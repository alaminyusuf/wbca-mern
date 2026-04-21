# WBCA MERN - Real-Time Chat Application

A modern, real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js), featuring Socket.IO for real-time communication and Redis for horizontal scalability.

## 🚀 Features

- **Real-Time Messaging**: Instant message delivery using Socket.io.
- **Room-Based Chat**: Join and create different chat rooms (global by default).
- **Typing Indicators**: See who is currently typing in a room.
- **JWT Authentication**: Secure login and signup with JWT stored in cookies.
- **State Persistence**: Messages are saved in MongoDB and loaded on room join.
- **High Performance**: Scalable architecture using Redis for socket message broadcasting across instances.
- **Modern UI**: Styled with Tailwind CSS 4 for a premium, responsive design.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, React Router 7.
- **Backend**: Node.js, Express, Socket.IO, Redis.
- **Database**: MongoDB (Mongoose).
- **Infrastructure**: Docker & Docker Compose.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [MongoDB](https://www.mongodb.com/) (if running locally)
- [Redis](https://redis.io/) (if running locally)

## ⚙️ Project Structure
```bash
.
├── client/          # Vite + React Frontend
├── server/          # Node.js + Express Backend
├── .env.example     # Template for environment variables
└── docker-compose.yml
```

## 🛠️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/alaminyusuf/wbca-mern.git
cd wbca-mern
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration.

### 3. Running with Docker (Recommended)
The easiest way to get the project running is using Docker Compose:
```bash
docker-compose up --build
```
This will start the server, MongoDB, and Redis. The client needs to be started separately during development.

### 4. Running Locally

#### Backend
```bash
cd server
npm install
npm run dev
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/wbca` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for JWT signing | `change_me` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `VITE_API_URL` | Backend API URL for the client | `http://localhost:5000` |

---
Built with ❤️ by [alaminyusuf](https://github.com/alaminyusuf)
