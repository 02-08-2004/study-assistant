# 📚 Study Assistant — AI-Powered Learning Platform

[![GitHub Profile](https://img.shields.io/badge/GitHub-02--08--2004-105666?style=for-the-badge&logo=github)](https://github.com/02-08-2004)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![Groq AI](https://img.shields.io/badge/Groq_AI-Llama_3.3_70B-F7F4D5?style=for-the-badge&logo=openai)](https://console.groq.com)

A high-density, SaaS-inspired interactive study application designed with modern desktop aesthetics (**Linear, Notion, ChatGPT Desktop, Spotify**). Turn free-form notes or topics into interactive **3D Flashcards** or **Adaptive Quizzes** powered by Groq's Llama 3.3 70B model.

---

## ✨ Features

- **⚡ Instant AI Material Generation**: Converts raw notes or topic prompts into structured flashcards or multiple-choice quizzes with automated schema validation and 3-tier retry logic.
- **🃏 3D Interactive Flashcards**: Flip cards with smooth 3D perspective, progress tracking, and complete study controls.
- **🎯 Unified Quiz Performance & Smart Retesting**: Single-card score metrics with 1-click **Retest Wrong Answers** workflow.
- **🗂️ Persistent History Drawer**: LocalStorage session library with slide-in drawer access and unfinished session prompt intercepts.
- **🎨 Glassmorphism & Micro-animations**: Ambient floating gradient blobs, spring physics transitions (Framer Motion), and tactile ripple effects.
- **📱 100% Multi-Device Responsiveness**: Fluid scaling across mobile phones, foldables, tablets, laptops, and ultra-wide displays.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Framer Motion, Vanilla CSS (Design Tokens, Glassmorphism, Responsive Media Queries)
- **Backend**: Express.js, Node.js, CORS, Dotenv
- **AI Engine**: Groq API (`llama-3.3-70b-versatile`)
- **State & Storage**: Browser `localStorage` with full state persistence

---

## 🚀 How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher)
- Free [Groq API Key](https://console.groq.com)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/02-08-2004/study-assistant.git
cd study-assistant
```

---

### Step 2: Configure Backend
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
```

Start the backend server:
```bash
npm run dev
```
*(Runs on `http://localhost:5000`)*

---

### Step 3: Configure Frontend
In a **new terminal tab**:
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173`)*

Open **http://localhost:5173** in your browser.

---

## 🌐 Production Deployment (Vercel)

The repository is pre-configured with `vercel.json` for 1-click monorepo deployment:

### 1-Click Vercel Import:
1. Go to [vercel.com/new](https://vercel.com/new) and import `02-08-2004/study-assistant`.
2. Add Environment Variable:
   - `GROQ_API_KEY`: `your_groq_api_key`
3. Click **Deploy**. Both Frontend and Backend services build automatically under a single URL!

---

## 👤 Author

Developed with ❤️ by **[Sowjanya](https://github.com/02-08-2004)**

- **GitHub**: [https://github.com/02-08-2004](https://github.com/02-08-2004)
- **Repository**: [https://github.com/02-08-2004/study-assistant](https://github.com/02-08-2004/study-assistant)