# 🗳️ Live Polling System

**Live Polling System** is a full-stack, real-time classroom polling application. It empowers teachers to create instant polls, manage live sessions, and visualize responses as they happen, while providing students with a seamless, engaging interface to participate.

Built with modern web technologies including React, Node.js, Socket.IO, and MongoDB.

## ✨ Key Features

### 👨‍🏫 For Teachers
- **Live Dashboard**: Create and launch questions instantly.
- **Real-time Visualization**: Watch results update live as students vote.
- **Session Control**: 
  - Set custom timers for questions (e.g., 60 seconds).
  - Control question flow (prevent answering when no active question).
  - Manage participants (kick/remove students if needed).
- **History**: Access past poll results and session data.
- **Live Chat**: Direct in-app communication channel with students.

### 🎓 For Students
- **Instant Join**: No registration required—just enter a name to join via the current session.
- **Interactive Interface**: Receive questions immediately on your device.
- **Instant Feedback**: View global class results immediately after voting or when the timer ends.
- **Live Chat**: Ask questions or provide feedback to the teacher in real-time.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Real-time**: Socket.IO
- **Database**: MongoDB (Mongoose)
- **State Management**: React Query, Context API

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or using MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Live-Polling-System
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Local MongoDB
   MONGO_URI=mongodb://localhost:27017/live-poll-system
   
   # Or MongoDB Atlas Connection String
   # MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname
   ```

4. **Run Locally**
   Start both the backend server and frontend client concurrently:
   ```bash
   npm run dev:all
   ```
   - **Frontend**: http://localhost:8080 (or next available port)
   - **Backend**: http://localhost:5000

---

## 🌍 Deployment

This project handles deployment by splitting the Backend (API) and Frontend (Client) into separate services.

### Phase 1: Deploy Backend (Render)
1. Push your code to a GitHub repository.
2. Create a new **Web Service** on [Render](https://dashboard.render.com/).
3. Connect your repository and use these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
4. Add Environment Variable:
   - `MONGO_URI`: Your MongoDB Connection String.
5. **Copy the deployed URL** (e.g., `https://your-app.onrender.com`).

### Phase 2: Deploy Frontend (Vercel)
1. Import your repository into [Vercel](https://vercel.com/new).
2. The default build settings (`vite build`) are correct.
3. Add Environment Variable:
   - `VITE_API_URL`: The Backend URL from Phase 1 (e.g., `https://your-app.onrender.com`).
4. Click **Deploy**.

---

## 🖼️ Gallery

![Screenshot (72)](https://github.com/user-attachments/assets/2c2e1c74-6756-401e-a97f-561feeb86bee)
![Screenshot (73)](https://github.com/user-attachments/assets/d5a6c73b-4415-474e-b958-6b3a9ce1d479)
![Screenshot (74)](https://github.com/user-attachments/assets/0db79005-a34c-4807-9ee3-1af946135bb1)
![Screenshot (79)](https://github.com/user-attachments/assets/98e34bb0-5ea2-4612-86ed-6ac886c56421)



