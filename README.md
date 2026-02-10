# Knowledge Weaver

**Your mind, extended.**

Knowledge Weaver is an AI-powered second brain application designed to help you capture, organize, and synthesize your thoughts. It combines a modern, responsive React frontend with a robust Next.js backend to provide intelligent note management, pattern recognition, and semantic search.

## 🏗 Architecture

The system consists of a Vite-based React frontend and a Next.js backend API, communicating over HTTP.

```mermaid
graph TD
    User[User] -->|Interacts| Client[Frontend (React + Vite)]
    Client -->|API Requests| Server[Backend (Next.js API Routes)]
    Server -->|Queries| DB[(PostgreSQL Database)]
    Server -->|AI Processing| AI[AI Services (Claude/Gemini/Ollama)]
    
    subgraph "Frontend"
        Client
    end
    
    subgraph "Backend Services"
        Server
        DB
    end
    
    subgraph "External Services"
        AI
    end
```

## 🚀 Features

- **📝 Intelligent Note Taking**: Capture ideas instantly with rich text support.
- **🤖 AI-Powered Analysis**: Automatic summarization, tagging, and insight generation.
- **🕸️ Pattern Recognition**: Discover hidden connections between your notes.
- **💬 Knowledge Chat**: Chat with your second brain to retrieve information.
- **🎨 Premium UI**: Glassmorphism design with dark mode and responsive layout.

## 🛠 Tech Stack

### Frontend (`knowledge-weaver-main`)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Language**: TypeScript
- **State Management**: React Query (TanStack Query)

### Backend (`second-brain-backend`)
- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL (via Neon)
- **ORM**: Prisma
- **AI Integration**: Google Gemini, Anthropic Claude, Ollama

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **PostgreSQL**: A running instance (local or cloud like Neon.tech)

## 🏁 Getting Started

### 1. Clone the Repository

```bash
git clone <repository_url>
cd knowledge-weaver-main
```

### 2. Backend Setup (`second-brain-backend`)

The backend handles data persistence and AI processing.

1.  **Navigate to the backend directory:**
    ```bash
    cd second-brain-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in `second-brain-backend/` based on provided examples.
    
    **Required Variables:**
    ```env
    DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
    FRONTEND_URL="http://localhost:8080"
    
    # AI Keys (At least one required)
    GEMINI_API_KEY="your_key"
    # ANTHROPIC_API_KEY="your_key"
    # OLLAMA_HOST="http://127.0.0.1:11434"
    ```

4.  **Setup Database:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Start Backend Server:**
    ```bash
    npm run dev
    # Server starts at http://localhost:3000
    ```

### 3. Frontend Setup (`knowledge-weaver-main`)

The frontend provides the user interface.

1.  **Open a new terminal** and navigate to the frontend directory:
    ```bash
    cd knowledge-weaver-main
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start Frontend Server:**
    ```bash
    npm run dev
    # Application starts at http://localhost:8080
    ```

## 📚 API Overview

The backend exposes several key endpoints for the frontend:

- `GET /api/notes`: Retrieve all notes
- `POST /api/notes`: Create a new note
- `POST /api/chat`: Chat with your knowledge base
- `POST /api/summarize`: Generate AI summary for a note
- `GET /api/patterns`: Retrieve AI-detected patterns

---

Built with ❤️ for the **Knowledge Weaver** project.
