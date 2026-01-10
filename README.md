# 🚀 VectorShift – Visual AI Pipeline Builder

VectorShift is a **visual workflow builder** that lets users design, connect, and execute AI-powered pipelines using a drag-and-drop interface. It combines a modern React-based frontend with a FastAPI backend and integrates **Mistral AI** for intelligent text processing.

The goal is to make AI workflows **visual, composable, and production-ready**.

---

## ✨ Features

- 🧩 **Node-based Pipeline Builder** (React Flow)
- 🎨 Clean & responsive UI with **Tailwind CSS**
- ⚡ Global state management using **Zustand**
- 🔗 Connect nodes visually to define execution flow
- 🧠 AI-powered text processing via **Mistral AI**
- 🚀 Backend orchestration using **FastAPI**
- 🗄️ Persistent pipeline storage with **PostgreSQL**
- 📤 Execute pipelines and view structured outputs
- 🔄 Extensible architecture for adding custom nodes

---

## 🖥️ Tech Stack

### Frontend
- **React**
- **React Flow** – visual node-based editor
- **Tailwind CSS** – utility-first styling
- **Zustand** – lightweight state management

### Backend
- **FastAPI** – high-performance Python backend
- **PostgreSQL** – relational database
- **Mistral AI** – LLM integration for text intelligence
- **SQLAlchemy / Prisma (optional)** – ORM layer

---

## 🧠 How It Works

1. Users create nodes (Input, Text, Output, etc.)
2. Nodes are connected visually to define data flow
3. Pipeline configuration is sent to the backend
4. Backend executes nodes in sequence
5. Mistral AI processes text where required
6. Final output is returned and displayed in the UI

---

## 📸 UI Preview

> Visual pipeline editor with draggable nodes and connections

- Input Node → Text Node → Output Node  
- Real-time validation and execution feedback  
- Clean, minimal, developer-friendly UX  

---

## 🗂️ Project Structure

```bash
.
├── frontend/
│   ├── src/
│   │   ├── components/        # React Flow nodes & UI components
│   │   ├── stores/             # Zustand stores
│   │   ├── nodes/
│   │   ├── lib/
│   │   └── App.tsx
│   └── tailwind.config.js
│
├── backend/
│   ├── .venv
│   ├── src/
│   │   ├── config/            # DB configurations
│   │   ├── controllers/       # AI & pipeline logic
│   │   ├── routes/            # routes
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── utils/             # utility helper functions
│   │   └── api.py             # main router
│   ├── main.py
│   └── requirements.txt
│
└── README.md


## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/vectorshift.git
cd vectorshift

### 2️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev


Create a frontend/.env file:
```bash
VITE_API_BASE_URL="http://localhost:8000/api/v1"


Frontend will run at:
```bash
http://localhost:5173


### 3️⃣ Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt


Create a backend/.env file:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/vectorshift
MISTRAL_API_KEY=your_api_key_here


Run the backend:
```bash
fastapi dev main.py

Backend will run at:http://localhost:8000


### 🔌 API Overview
Method	Endpoint	                    Description
POST	  /pipelines/execute	          Execute a pipeline
POST	  /pipelines/save	              Save pipeline configuration
GET	    /pipelines/{id}	              Fetch pipeline details
GET	    /health	Health check          Health check