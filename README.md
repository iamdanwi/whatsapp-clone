# WhatsApp Clone

A full-stack real-time messaging and video calling application built with the MERN stack (MongoDB, Express, React/Next.js, Node.js), Socket.io, and WebRTC.

## 🚀 Features

-   **Real-time Messaging**: Instant messaging using Socket.io.
-   **Audio & Video Calls**: High-quality peer-to-peer calls using WebRTC (`simple-peer`).
-   **Authentication**: Secure JWT-based authentication.
-   **Online Status**: Real-time user online/offline status updates.
-   **Message Queue**: Robust message processing using BullMQ and Redis.
-   **Modern UI**: Sleek, responsive design with glassmorphism effects and dark mode support using Tailwind CSS.
-   **File Sharing**: Image support in chats and profile updates.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: Next.js 16 (App Router)
-   **Styling**: Tailwind CSS, Shadcn/ui
-   **State Management**: Zustand
-   **Real-time**: Socket.io-client
-   **WebRTC**: Simple-peer
-   **HTTP Client**: Axios

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose)
-   **Caching/Queues**: Redis (ioredis), BullMQ
-   **Real-time**: Socket.io
-   **Authentication**: JSON Web Tokens (JWT), bcryptjs

## ⚙️ Prerequisites

Before running the project, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18+ recommended)
-   [MongoDB](https://www.mongodb.com/) (Local or Atlas)
-   [Redis](https://redis.io/) (Required for message queues)

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/iamdanwi/whatsapp-clone
cd whatsapp-clone
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5001
MONGO_DB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The application should now be accessible at `http://localhost:3000`.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
