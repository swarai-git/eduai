<<<<<<< HEAD
🎓 EduAI – Offline RAG-Based Teaching Assistant
📌 Overview

EduAI is an AI-powered teaching assistant designed to provide accurate, context-aware answers using Retrieval-Augmented Generation (RAG).

Traditional AI models generate answers based only on pre-trained knowledge, which can lead to generic or incorrect responses. EduAI solves this by retrieving relevant information from a local knowledge base and combining it with a locally running language model, ensuring answers are both relevant and reliable.

✅ Works completely offline
✅ No dependency on paid APIs
✅ Designed for students and educational use

🎯 Objectives
Provide an offline AI tutor for students
Improve answer accuracy using retrieval-based context
Reduce dependency on internet-based AI services
Build a scalable and explainable AI system
✨ Key Features
🤖 AI-Based Question Answering
Generates human-like responses to user queries
🔍 Context Retrieval (RAG)
Fetches relevant content from a knowledge base before answering
📚 Improved Accuracy
Reduces hallucination by grounding responses in real data
⚡ Offline Functionality
Uses local LLM via Ollama (no API required)
🎯 Student-Focused Design
Simple UI for easy interaction
🧠 What is RAG?

Retrieval-Augmented Generation (RAG) is a technique that combines:

Information Retrieval → Finds relevant data
Language Generation → Generates final answer

This ensures the AI responds based on actual data, not just assumptions.

🏗️ System Architecture
User Query
    ↓
Frontend (React UI)
    ↓
Backend (FastAPI)
    ↓
Retriever (FAISS / ChromaDB)
    ↓
Relevant Context
    ↓
LLM (Ollama - Gemma)
    ↓
Final Response
🛠️ Tech Stack
Frontend
React (Vite)
Tailwind CSS
Backend
FastAPI (Python)
AI & Data
Ollama (Local LLM – Gemma 3B/1B)
FAISS / ChromaDB (Vector Database)
📂 Project Structure
project/
├── backend/
│   ├── main.py            # FastAPI entry point
│   ├── retriever.py       # Handles document retrieval
│   ├── generator.py       # Handles LLM response generation
│   ├── requirements.txt   # Python dependencies
│   └── venv/              # Virtual environment
│
├── frontend/
│   ├── src/               # React components
│   ├── public/
│   ├── index.html
│   └── package.json
│
└── README.md
⚙️ Installation & Setup
🔹 Step 1: Clone Repository
git clone <your-repo-link>
cd project
🔹 Step 2: Backend Setup
cd backend

# Activate virtual environment (Windows)
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
uvicorn main:app --reload

📍 Backend runs on:
http://127.0.0.1:8000

🔹 Step 3: Frontend Setup
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

📍 Frontend runs on:
http://localhost:5173

🔹 Step 4: Run AI Model (Ollama)

Make sure Ollama is installed, then run:

ollama run gemma3:1b

To verify installed models:

ollama list
🔄 Working Flow
User enters a question in the frontend
Request is sent to FastAPI backend
Retriever searches for relevant content
Context is passed to the LLM (Ollama)
Model generates final answer
Response is displayed in UI
=======
🎓 EduAI – Offline RAG-Based Teaching Assistant
📌 Overview

EduAI is an AI-powered teaching assistant designed to provide accurate, context-aware answers using Retrieval-Augmented Generation (RAG).

Traditional AI models generate answers based only on pre-trained knowledge, which can lead to generic or incorrect responses. EduAI solves this by retrieving relevant information from a local knowledge base and combining it with a locally running language model, ensuring answers are both relevant and reliable.

✅ Works completely offline
✅ No dependency on paid APIs
✅ Designed for students and educational use

🎯 Objectives
Provide an offline AI tutor for students
Improve answer accuracy using retrieval-based context
Reduce dependency on internet-based AI services
Build a scalable and explainable AI system
✨ Key Features
🤖 AI-Based Question Answering
Generates human-like responses to user queries
🔍 Context Retrieval (RAG)
Fetches relevant content from a knowledge base before answering
📚 Improved Accuracy
Reduces hallucination by grounding responses in real data
⚡ Offline Functionality
Uses local LLM via Ollama (no API required)
🎯 Student-Focused Design
Simple UI for easy interaction
🧠 What is RAG?

Retrieval-Augmented Generation (RAG) is a technique that combines:

Information Retrieval → Finds relevant data
Language Generation → Generates final answer

This ensures the AI responds based on actual data, not just assumptions.

🏗️ System Architecture
User Query
    ↓
Frontend (React UI)
    ↓
Backend (FastAPI)
    ↓
Retriever (FAISS / ChromaDB)
    ↓
Relevant Context
    ↓
LLM (Ollama - Gemma)
    ↓
Final Response
🛠️ Tech Stack
Frontend
React (Vite)
Tailwind CSS
Backend
FastAPI (Python)
AI & Data
Ollama (Local LLM – Gemma 3B/1B)
FAISS / ChromaDB (Vector Database)
📂 Project Structure
project/
├── backend/
│   ├── main.py            # FastAPI entry point
│   ├── retriever.py       # Handles document retrieval
│   ├── generator.py       # Handles LLM response generation
│   ├── requirements.txt   # Python dependencies
│   └── venv/              # Virtual environment
│
├── frontend/
│   ├── src/               # React components
│   ├── public/
│   ├── index.html
│   └── package.json
│
└── README.md
⚙️ Installation & Setup
🔹 Step 1: Clone Repository
git clone <your-repo-link>
cd project
🔹 Step 2: Backend Setup
cd backend

# Activate virtual environment (Windows)
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
uvicorn main:app --reload

📍 Backend runs on:
http://127.0.0.1:8000

🔹 Step 3: Frontend Setup
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

📍 Frontend runs on:
http://localhost:5173

🔹 Step 4: Run AI Model (Ollama)

Make sure Ollama is installed, then run:

ollama run gemma3:1b

To verify installed models:

ollama list
🔄 Working Flow
User enters a question in the frontend
Request is sent to FastAPI backend
Retriever searches for relevant content
Context is passed to the LLM (Ollama)
Model generates final answer
Response is displayed in UI
>>>>>>> 6b6d7b1 (Improved AI tutor logic and fixed prediction errors)
